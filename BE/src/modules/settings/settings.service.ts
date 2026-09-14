import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import type { UpdateSettingsInput, ChangePasswordInput } from './settings.schemas';
import type { UserSettingsResponse } from './settings.types';

export class SettingsService {
  async getSettings(userId: string): Promise<UserSettingsResponse> {
    const settings = await prisma.userSetting.findUnique({
      where: { userId },
    });

    if (!settings) {
      throw new Error('Cài đặt người dùng không tồn tại');
    }

    return {
      userId: settings.userId,
      theme: settings.theme,
      language: settings.language,
      emailNotifications: settings.emailNotifications,
      pushNotifications: settings.pushNotifications,
      deadlineReminderHours: settings.deadlineReminderHours,
      timetableAlerts: settings.timetableAlerts,
      soundEffects: settings.soundEffects,
      twoFactorAuth: settings.twoFactorAuth,
      loginAlerts: settings.loginAlerts,
      autoSaveDrafts: settings.autoSaveDrafts,
    };
  }

  async updateSettings(userId: string, input: UpdateSettingsInput): Promise<UserSettingsResponse> {
    const existing = await prisma.userSetting.findUnique({
      where: { userId },
    });

    if (!existing) {
      throw new Error('Cài đặt người dùng không tồn tại');
    }

    await prisma.userSetting.update({
      where: { userId },
      data: input,
    });

    return this.getSettings(userId);
  }

  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    const isMatch = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new Error('Mật khẩu hiện tại không chính xác');
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(input.newPassword, saltRounds);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  }
}

export const settingsService = new SettingsService();
