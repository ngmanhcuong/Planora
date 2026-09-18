import { prisma } from '../../config/prisma';
import bcrypt from 'bcryptjs';

type AdminUserRole = 'USER' | 'ADMIN';

export class AdminService {
  async getOverview() {
    const [totalUsers, adminUsers, verifiedUsers, totalTasks, completedTasks, totalEvents, totalTimetables, totalHabits, totalNotifications] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { isVerified: true } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'COMPLETED' } }),
      prisma.event.count(),
      prisma.timetable.count(),
      prisma.habit.count(),
      prisma.notification.count(),
    ]);

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            tasks: true,
            events: true,
            timetables: true,
            habits: true,
          },
        },
      },
    });

    return {
      totals: {
        users: totalUsers,
        admins: adminUsers,
        verifiedUsers,
        tasks: totalTasks,
        completedTasks,
        events: totalEvents,
        timetables: totalTimetables,
        habits: totalHabits,
        notifications: totalNotifications,
      },
      recentUsers,
    };
  }

  async listUsers(search?: string) {
    const normalizedSearch = search?.trim();
    return prisma.user.findMany({
      where: normalizedSearch
        ? {
            OR: [
              { name: { contains: normalizedSearch } },
              { email: { contains: normalizedSearch } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            tasks: true,
            events: true,
            timetables: true,
            habits: true,
            notifications: true,
          },
        },
      },
    });
  }

  async updateUserRole(currentAdminId: string, userId: string, role: AdminUserRole) {
    if (currentAdminId === userId && role !== 'ADMIN') {
      throw new Error('Không thể tự hạ quyền admin của chính bạn.');
    }

    return prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true, isVerified: true, updatedAt: true },
    });
  }

  async updateUserVerification(userId: string, isVerified: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { isVerified },
      select: { id: true, name: true, email: true, role: true, isVerified: true, updatedAt: true },
    });
  }

  async resetUserPassword(userId: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
      select: { id: true, name: true, email: true, role: true, isVerified: true, updatedAt: true },
    });
  }

  async deleteUser(currentAdminId: string, userId: string) {
    if (currentAdminId === userId) {
      throw new Error('Không thể tự xóa tài khoản admin đang đăng nhập.');
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!user) throw new Error('Không tìm thấy người dùng.');
    if (user.role === 'ADMIN') throw new Error('Không thể xóa tài khoản admin khác từ giao diện này.');

    await prisma.user.delete({ where: { id: userId } });
    return { deleted: true };
  }
}

export const adminService = new AdminService();
