import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { signAccessToken } from '../../utils/jwt';
import { sendPasswordResetOtpEmail } from '../../utils/mailer';
import type {
  RegisterInput,
  LoginInput,
  GoogleLoginInput,
  ForgotPasswordInput,
  RequestPasswordResetOtpInput,
  VerifyPasswordResetOtpInput,
} from './auth.schemas';
import type { AuthSuccessData, SafeUserResponse } from './auth.types';

type GoogleTokenPayload = {
  aud?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
  sub?: string;
};

type PasswordResetOtpRecord = {
  email: string;
  otpHash: string;
  expiresAt: number;
  verified: boolean;
  attempts: number;
};

const passwordResetOtpStore = new Map<string, PasswordResetOtpRecord>();
const PASSWORD_RESET_OTP_TTL_MS = 10 * 60 * 1000;
const PASSWORD_RESET_OTP_MAX_ATTEMPTS = 5;

const createOtpCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export class AuthService {
  async googleLogin(input: GoogleLoginInput): Promise<AuthSuccessData> {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(input.credential)}`);
    if (!response.ok) {
      throw new Error('Mã xác thực Google không hợp lệ hoặc đã hết hạn.');
    }

    const payload = (await response.json()) as GoogleTokenPayload;
    const expectedClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;

    if (expectedClientId && payload.aud !== expectedClientId) {
      throw new Error('Tài khoản Google không khớp cấu hình ứng dụng.');
    }

    if (!payload.email || payload.email_verified !== true && payload.email_verified !== 'true') {
      throw new Error('Google chưa xác minh email của tài khoản này.');
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    const displayName = payload.name ? payload.name.trim() : normalizedEmail.split('@')[0];

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      const randomPassword = await bcrypt.hash(Math.random().toString(36) + Date.now().toString(), 10);
      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name: displayName,
            email: normalizedEmail,
            passwordHash: randomPassword,
            isVerified: true,
          },
        });

        await tx.profile.create({
          data: {
            userId: newUser.id,
            avatarUrl: payload.picture || null,
          },
        });

        await tx.userSetting.create({
          data: {
            userId: newUser.id,
          },
        });

        const defaultCategories = [
          { name: 'Học tập', type: 'STUDY' as const, color: '#0058BE', bgColor: '#D8E2FF', textColor: '#001A42' },
          { name: 'Công việc', type: 'WORK' as const, color: '#3525CD', bgColor: '#DAE2FD', textColor: '#131B2E' },
          { name: 'Cuộc họp', type: 'MEETING' as const, color: '#4F46E5', bgColor: '#E2DFFF', textColor: '#3323CC' },
          { name: 'Thói quen', type: 'HABIT' as const, color: '#006E4B', bgColor: '#D7E8CD', textColor: '#002113' },
          { name: 'Sắp đến hạn', type: 'DEADLINE' as const, color: '#BA1A1A', bgColor: '#FFDAD6', textColor: '#93000A' },
          { name: 'Cá nhân', type: 'PERSONAL' as const, color: '#64748B', bgColor: '#F1F5F9', textColor: '#0F172A' },
        ];

        for (const cat of defaultCategories) {
          await tx.category.create({
            data: {
              userId: newUser.id,
              name: cat.name,
              type: cat.type,
              color: cat.color,
              bgColor: cat.bgColor,
              textColor: cat.textColor,
            },
          });
        }

        return newUser;
      });
    }

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const safeUser: SafeUserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    return {
      user: safeUser,
      accessToken,
    };
  }

  async register(input: RegisterInput): Promise<AuthSuccessData> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // Check existing email
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new Error('Email này đã được đăng ký tài khoản');
    }

    // Hash password securely
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(input.password, saltRounds);

    // Create user and related entities in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: input.name.trim(),
          email: normalizedEmail,
          passwordHash,
        },
      });

      // Default Profile
      await tx.profile.create({
        data: {
          userId: user.id,
        },
      });

      // Default Settings
      await tx.userSetting.create({
        data: {
          userId: user.id,
        },
      });

      // Default Categories
      const defaultCategories = [
        { name: 'Học tập', type: 'STUDY' as const, color: '#0058BE', bgColor: '#D8E2FF', textColor: '#001A42' },
        { name: 'Công việc', type: 'WORK' as const, color: '#3525CD', bgColor: '#DAE2FD', textColor: '#131B2E' },
        { name: 'Cuộc họp', type: 'MEETING' as const, color: '#4F46E5', bgColor: '#E2DFFF', textColor: '#3323CC' },
        { name: 'Thói quen', type: 'HABIT' as const, color: '#006E4B', bgColor: '#D7E8CD', textColor: '#002113' },
        { name: 'Sắp đến hạn', type: 'DEADLINE' as const, color: '#BA1A1A', bgColor: '#FFDAD6', textColor: '#93000A' },
        { name: 'Cá nhân', type: 'PERSONAL' as const, color: '#64748B', bgColor: '#F1F5F9', textColor: '#0F172A' },
      ];

      for (const cat of defaultCategories) {
        await tx.category.create({
          data: {
            userId: user.id,
            name: cat.name,
            type: cat.type,
            color: cat.color,
            bgColor: cat.bgColor,
            textColor: cat.textColor,
          },
        });
      }

      return user;
    });

    const accessToken = signAccessToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const safeUser: SafeUserResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isVerified: newUser.isVerified,
      createdAt: newUser.createdAt,
    };

    return {
      user: safeUser,
      accessToken,
    };
  }

  async login(input: LoginInput): Promise<AuthSuccessData> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Generic error message to prevent account enumeration
    if (!user) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const safeUser: SafeUserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    return {
      user: safeUser,
      accessToken,
    };
  }

  async requestPasswordResetOtp(input: RequestPasswordResetOtpInput): Promise<void> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new Error('Không tìm thấy tài khoản với email này');
    }

    const otp = createOtpCode();
    const otpHash = await bcrypt.hash(otp, 10);

    passwordResetOtpStore.set(normalizedEmail, {
      email: normalizedEmail,
      otpHash,
      expiresAt: Date.now() + PASSWORD_RESET_OTP_TTL_MS,
      verified: false,
      attempts: 0,
    });

    void sendPasswordResetOtpEmail(user.email, otp).catch((error) => {
      console.error('[Password Reset OTP] Failed to send email:', {
        email: user.email,
        message: error?.message || error,
        code: error?.code,
      });
    });
  }

  async verifyPasswordResetOtp(input: VerifyPasswordResetOtpInput): Promise<void> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const record = passwordResetOtpStore.get(normalizedEmail);

    if (!record) {
      throw new Error('Mã OTP không tồn tại hoặc đã hết hạn');
    }

    if (Date.now() > record.expiresAt) {
      passwordResetOtpStore.delete(normalizedEmail);
      throw new Error('Mã OTP đã hết hạn');
    }

    if (record.attempts >= PASSWORD_RESET_OTP_MAX_ATTEMPTS) {
      passwordResetOtpStore.delete(normalizedEmail);
      throw new Error('Bạn đã nhập sai OTP quá nhiều lần. Vui lòng gửi lại mã mới');
    }

    const isMatch = await bcrypt.compare(input.otp, record.otpHash);
    if (!isMatch) {
      record.attempts += 1;
      passwordResetOtpStore.set(normalizedEmail, record);
      throw new Error('Mã OTP không chính xác');
    }

    passwordResetOtpStore.set(normalizedEmail, {
      ...record,
      verified: true,
    });
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new Error('Không tìm thấy tài khoản với email này');
    }

    const record = passwordResetOtpStore.get(normalizedEmail);
    if (!record || Date.now() > record.expiresAt || !record.verified) {
      throw new Error('Vui lòng xác minh OTP trước khi đặt lại mật khẩu');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(input.newPassword, saltRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    passwordResetOtpStore.delete(normalizedEmail);
  }
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        profile: {
          select: {
            studentId: true,
            major: true,
            university: true,
            gpa: true,
            completedCredits: true,
            totalCredits: true,
            bio: true,
            avatarUrl: true,
          },
        },
        settings: {
          select: {
            theme: true,
            language: true,
            emailNotifications: true,
            pushNotifications: true,
            deadlineReminderHours: true,
            timetableAlerts: true,
            soundEffects: true,
            twoFactorAuth: true,
            loginAlerts: true,
            autoSaveDrafts: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    return user;
  }
}

export const authService = new AuthService();

