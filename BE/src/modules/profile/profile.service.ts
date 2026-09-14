import { prisma } from '../../config/prisma';
import type { UpdateProfileInput } from './profile.schemas';
import type { UserProfileResponse } from './profile.types';

export class ProfileService {
  async getProfile(userId: string): Promise<UserProfileResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profile: true,
      },
    });

    if (!user || !user.profile) {
      throw new Error('Hồ sơ người dùng không tồn tại');
    }

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      studentId: user.profile.studentId,
      major: user.profile.major,
      university: user.profile.university,
      gpa: user.profile.gpa,
      completedCredits: user.profile.completedCredits,
      totalCredits: user.profile.totalCredits,
      bio: user.profile.bio,
      avatarUrl: user.profile.avatarUrl,
    };
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfileResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, profile: true },
    });

    if (!existingUser || !existingUser.profile) {
      throw new Error('Hồ sơ người dùng không tồn tại');
    }

    const currentProfile = existingUser.profile;

    // Cross-field validation with existing values
    const newCompleted = input.completedCredits ?? currentProfile.completedCredits;
    const newTotal = input.totalCredits ?? currentProfile.totalCredits;

    if (newCompleted > newTotal) {
      throw new Error('Số tín chỉ đã hoàn thành không được vượt quá tổng số tín chỉ');
    }

    const { name, ...profileFields } = input;

    await prisma.$transaction(async (tx) => {
      // Update User table if name is provided
      if (name !== undefined) {
        await tx.user.update({
          where: { id: userId },
          data: { name: name.trim() },
        });
      }

      // Filter out undefined profile fields
      const cleanData: Record<string, any> = {};
      for (const [key, val] of Object.entries(profileFields)) {
        if (val !== undefined) {
          cleanData[key] = val === '' ? null : val;
        }
      }

      if (Object.keys(cleanData).length > 0) {
        await tx.profile.update({
          where: { userId },
          data: cleanData,
        });
      }
    });

    return this.getProfile(userId);
  }
}

export const profileService = new ProfileService();
