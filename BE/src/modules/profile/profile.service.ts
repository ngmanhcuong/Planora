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
      select: { id: true, email: true, name: true, profile: true },
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

    const { name, email, ...profileFields } = input;

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== existingUser.email) {
        const emailOwner = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          select: { id: true },
        });

        if (emailOwner && emailOwner.id !== userId) {
          throw new Error('Email này đã được sử dụng bởi tài khoản khác');
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      // Update User table if identity fields are provided
      const userData: { name?: string; email?: string } = {};
      if (name !== undefined) {
        userData.name = name.trim();
      }
      if (email !== undefined) {
        userData.email = email.trim().toLowerCase();
      }

      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userData,
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
