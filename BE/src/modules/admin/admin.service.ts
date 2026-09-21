import { prisma } from '../../config/prisma';
import bcrypt from 'bcryptjs';
import type { AccountStatus, AccountTier, AdminContentType, CategoryType, NotificationCampaignStatus, Role, SupportTicketStatus } from '@prisma/client';

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role?: Role;
  accountTier?: AccountTier;
  status?: AccountStatus;
};

type UserAccountInput = {
  role?: Role;
  accountTier?: AccountTier;
  status?: AccountStatus;
  isVerified?: boolean;
};

type SupportTicketInput = {
  userId: string;
  subject: string;
  message: string;
};

type SupportTicketUpdateInput = {
  status?: SupportTicketStatus;
  adminReply?: string;
};

type SystemConfigInput = {
  key: string;
  label: string;
  value: string;
  description?: string;
};

type CategoryTemplateInput = {
  name: string;
  type: CategoryType;
  color?: string;
  bgColor?: string;
  textColor?: string;
  description?: string;
  isActive?: boolean;
};

type CampaignInput = {
  title: string;
  message: string;
  audience?: AccountTier | null;
  scheduledAt?: string | null;
  sendNow?: boolean;
};

type ContentInput = {
  type: AdminContentType;
  title: string;
  body: string;
  isPublished?: boolean;
};

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  accountTier: true,
  status: true,
  isVerified: true,
  lastActiveAt: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      tasks: true,
      events: true,
      timetables: true,
      habits: true,
      notifications: true,
      supportTickets: true,
    },
  },
} as const;

export class AdminService {
  private startOfDay(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private daysAgo(days: number) {
    const now = new Date();
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }

  async getOverview() {
    const today = this.startOfDay();
    const last30Days = this.daysAgo(30);

    const [
      totalUsers,
      activeUsers,
      lockedUsers,
      premiumUsers,
      adminUsers,
      verifiedUsers,
      dau,
      mau,
      totalTasks,
      completedTasks,
      totalEvents,
      totalTimetables,
      totalHabits,
      totalNotifications,
      openTickets,
      campaigns,
      publishedContent,
      configs,
      templates,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'LOCKED' } }),
      prisma.user.count({ where: { accountTier: { in: ['PREMIUM', 'VIP'] } } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { isVerified: true } }),
      prisma.user.count({ where: { lastActiveAt: { gte: today } } }),
      prisma.user.count({ where: { lastActiveAt: { gte: last30Days } } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'COMPLETED' } }),
      prisma.event.count(),
      prisma.timetable.count(),
      prisma.habit.count(),
      prisma.notification.count(),
      prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.notificationCampaign.count(),
      prisma.adminContent.count({ where: { isPublished: true } }),
      prisma.systemConfig.count(),
      prisma.globalCategoryTemplate.count({ where: { isActive: true } }),
    ]);

    const recentUsers = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 6, select: userSelect });
    const recentTickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return {
      totals: {
        users: totalUsers,
        activeUsers,
        lockedUsers,
        premiumUsers,
        admins: adminUsers,
        verifiedUsers,
        dau,
        mau,
        tasks: totalTasks,
        completedTasks,
        events: totalEvents,
        timetables: totalTimetables,
        habits: totalHabits,
        notifications: totalNotifications,
        openTickets,
        campaigns,
        publishedContent,
        configs,
        templates,
      },
      recentUsers,
      recentTickets,
    };
  }

  async getAnalytics() {
    const sevenDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return this.startOfDay(date);
    });

    const daily = await Promise.all(
      sevenDays.map(async (date) => {
        const next = new Date(date);
        next.setDate(date.getDate() + 1);
        const [activeUsers, createdTasks, completedTasks, events] = await Promise.all([
          prisma.user.count({ where: { lastActiveAt: { gte: date, lt: next } } }),
          prisma.task.count({ where: { createdAt: { gte: date, lt: next } } }),
          prisma.task.count({ where: { completedAt: { gte: date, lt: next } } }),
          prisma.event.count({ where: { createdAt: { gte: date, lt: next } } }),
        ]);
        return { date: date.toISOString().slice(0, 10), activeUsers, createdTasks, completedTasks, events };
      }),
    );

    const featureUsage = {
      tasks: await prisma.task.count(),
      events: await prisma.event.count(),
      timetables: await prisma.timetable.count(),
      habits: await prisma.habit.count(),
      aiConfigs: await prisma.systemConfig.count({ where: { key: { startsWith: 'ai.' } } }),
      notifications: await prisma.notification.count(),
    };

    return { daily, featureUsage };
  }

  async listUsers(search?: string) {
    const normalizedSearch = search?.trim();
    return prisma.user.findMany({
      where: normalizedSearch ? { OR: [{ name: { contains: normalizedSearch } }, { email: { contains: normalizedSearch } }] } : undefined,
      orderBy: { createdAt: 'desc' },
      select: userSelect,
    });
  }

  async createUser(input: CreateUserInput) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) throw new Error('Email này đã tồn tại trong hệ thống.');

    const passwordHash = await bcrypt.hash(input.password, 10);
    return prisma.user.create({
      data: {
        name: input.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: input.role ?? 'USER',
        accountTier: input.accountTier ?? 'FREE',
        status: input.status ?? 'ACTIVE',
        isVerified: true,
        profile: { create: {} },
        settings: { create: {} },
      },
      select: userSelect,
    });
  }

  async updateUserAccount(currentAdminId: string, userId: string, input: UserAccountInput) {
    if (currentAdminId === userId && input.role && input.role !== 'ADMIN') throw new Error('Không thể tự hạ quyền admin của chính bạn.');
    if (currentAdminId === userId && input.status === 'LOCKED') throw new Error('Không thể tự khóa tài khoản admin đang đăng nhập.');

    return prisma.user.update({ where: { id: userId }, data: input, select: userSelect });
  }

  async resetUserPassword(userId: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    return prisma.user.update({ where: { id: userId }, data: { passwordHash }, select: userSelect });
  }

  async deleteUser(currentAdminId: string, userId: string) {
    if (currentAdminId === userId) throw new Error('Không thể tự xóa tài khoản admin đang đăng nhập.');
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!user) throw new Error('Không tìm thấy người dùng.');
    if (user.role === 'ADMIN') throw new Error('Không thể xóa tài khoản admin khác từ giao diện này.');
    await prisma.user.delete({ where: { id: userId } });
    return { deleted: true };
  }

  async listTickets() {
    return prisma.supportTicket.findMany({ orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true, email: true } } } });
  }

  async createTicket(input: SupportTicketInput) {
    return prisma.supportTicket.create({ data: input, include: { user: { select: { id: true, name: true, email: true } } } });
  }

  async updateTicket(id: string, input: SupportTicketUpdateInput) {
    return prisma.supportTicket.update({ where: { id }, data: input, include: { user: { select: { id: true, name: true, email: true } } } });
  }

  async listConfigs() {
    return prisma.systemConfig.findMany({ orderBy: { key: 'asc' } });
  }

  async upsertConfig(input: SystemConfigInput) {
    return prisma.systemConfig.upsert({
      where: { key: input.key },
      update: { label: input.label, value: input.value, description: input.description },
      create: input,
    });
  }

  async deleteConfig(id: string) {
    await prisma.systemConfig.delete({ where: { id } });
    return { deleted: true };
  }

  async listCategoryTemplates() {
    return prisma.globalCategoryTemplate.findMany({ orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }] });
  }

  async createCategoryTemplate(input: CategoryTemplateInput) {
    return prisma.globalCategoryTemplate.create({
      data: {
        name: input.name,
        type: input.type,
        color: input.color ?? '#4F46E5',
        bgColor: input.bgColor ?? '#E2DFFF',
        textColor: input.textColor ?? '#3323CC',
        description: input.description,
        isActive: input.isActive ?? true,
      },
    });
  }

  async updateCategoryTemplate(id: string, input: Partial<CategoryTemplateInput>) {
    return prisma.globalCategoryTemplate.update({ where: { id }, data: input });
  }

  async deleteCategoryTemplate(id: string) {
    await prisma.globalCategoryTemplate.delete({ where: { id } });
    return { deleted: true };
  }

  async listCampaigns() {
    return prisma.notificationCampaign.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createCampaign(input: CampaignInput) {
    const campaign = await prisma.notificationCampaign.create({
      data: {
        title: input.title,
        message: input.message,
        audience: input.audience ?? null,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        status: 'DRAFT',
      },
    });
    if (input.sendNow) return this.sendCampaign(campaign.id);
    return campaign;
  }

  async sendCampaign(id: string) {
    const campaign = await prisma.notificationCampaign.findUnique({ where: { id } });
    if (!campaign) throw new Error('Không tìm thấy chiến dịch thông báo.');
    if (campaign.status === 'SENT') throw new Error('Chiến dịch này đã được gửi.');

    const recipients = await prisma.user.findMany({
      where: { role: 'USER', status: 'ACTIVE', ...(campaign.audience ? { accountTier: campaign.audience } : {}) },
      select: { id: true },
    });

    if (recipients.length > 0) {
      await prisma.notification.createMany({
        data: recipients.map((recipient) => ({
          userId: recipient.id,
          title: campaign.title,
          message: campaign.message,
          type: 'SYSTEM' as const,
          relatedEntityType: 'CAMPAIGN',
          relatedEntityId: campaign.id,
          link: '/notifications',
        })),
      });
    }

    return prisma.notificationCampaign.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date(), recipientsCount: recipients.length },
    });
  }

  async listContent() {
    return prisma.adminContent.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async createContent(input: ContentInput) {
    return prisma.adminContent.create({ data: { ...input, isPublished: input.isPublished ?? false } });
  }

  async updateContent(id: string, input: Partial<ContentInput>) {
    return prisma.adminContent.update({ where: { id }, data: input });
  }

  async deleteContent(id: string) {
    await prisma.adminContent.delete({ where: { id } });
    return { deleted: true };
  }
}

export const adminService = new AdminService();
