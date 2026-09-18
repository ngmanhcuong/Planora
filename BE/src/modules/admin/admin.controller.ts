import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { adminService } from './admin.service';
import { sendSuccess } from '../../utils/response';

const roleSchema = z.object({ role: z.enum(['USER', 'ADMIN']) });
const verificationSchema = z.object({ isVerified: z.boolean() });
const passwordSchema = z.object({ password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự') });

export const getAdminOverview = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await adminService.getOverview();
    sendSuccess(res, 'Lấy tổng quan quản trị thành công', data);
  } catch (error) {
    next(error);
  }
};

export const listAdminUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await adminService.listUsers(typeof req.query.search === 'string' ? req.query.search : undefined);
    sendSuccess(res, 'Lấy danh sách người dùng thành công', { users });
  } catch (error) {
    next(error);
  }
};

export const updateAdminUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = roleSchema.parse(req.body);
    const user = await adminService.updateUserRole(req.user!.userId, String(req.params.id), input.role);
    sendSuccess(res, 'Cập nhật quyền người dùng thành công', { user });
  } catch (error) {
    next(error);
  }
};

export const updateAdminUserVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = verificationSchema.parse(req.body);
    const user = await adminService.updateUserVerification(String(req.params.id), input.isVerified);
    sendSuccess(res, 'Cập nhật trạng thái xác minh thành công', { user });
  } catch (error) {
    next(error);
  }
};

export const resetAdminUserPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = passwordSchema.parse(req.body);
    const user = await adminService.resetUserPassword(String(req.params.id), input.password);
    sendSuccess(res, 'Đặt lại mật khẩu người dùng thành công', { user });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.deleteUser(req.user!.userId, String(req.params.id));
    sendSuccess(res, 'Xóa người dùng thành công', result);
  } catch (error) {
    next(error);
  }
};

