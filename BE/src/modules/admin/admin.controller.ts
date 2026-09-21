import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { adminService } from './admin.service';
import { sendSuccess } from '../../utils/response';

const roleEnum = z.enum(['USER', 'ADMIN', 'CONTENT_MANAGER', 'CUSTOMER_SUPPORT', 'ENTERPRISE_LEAD']);
const tierEnum = z.enum(['FREE', 'PREMIUM', 'VIP', 'INTERNAL']);
const statusEnum = z.enum(['ACTIVE', 'LOCKED']);
const ticketStatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']);
const categoryTypeEnum = z.enum(['STUDY', 'WORK', 'TASK', 'MEETING', 'PERSONAL', 'HABIT', 'DEADLINE']);
const contentTypeEnum = z.enum(['HANDBOOK', 'HOMEPAGE', 'BANNER']);

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: roleEnum.optional(),
  accountTier: tierEnum.optional(),
  status: statusEnum.optional(),
});
const userAccountSchema = z.object({ role: roleEnum.optional(), accountTier: tierEnum.optional(), status: statusEnum.optional(), isVerified: z.boolean().optional() });
const passwordSchema = z.object({ password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự') });
const ticketSchema = z.object({ userId: z.string().min(1), subject: z.string().min(3), message: z.string().min(3) });
const ticketUpdateSchema = z.object({ status: ticketStatusEnum.optional(), adminReply: z.string().optional() });
const configSchema = z.object({ key: z.string().min(2), label: z.string().min(2), value: z.string().min(1), description: z.string().optional() });
const templateSchema = z.object({ name: z.string().min(2), type: categoryTypeEnum, color: z.string().optional(), bgColor: z.string().optional(), textColor: z.string().optional(), description: z.string().optional(), isActive: z.boolean().optional() });
const campaignSchema = z.object({ title: z.string().min(2), message: z.string().min(3), audience: tierEnum.nullable().optional(), scheduledAt: z.string().nullable().optional(), sendNow: z.boolean().optional() });
const contentSchema = z.object({ type: contentTypeEnum, title: z.string().min(2), body: z.string().min(3), isPublished: z.boolean().optional() });

const id = (req: Request) => String(req.params.id);

export const getAdminOverview = async (_req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Lấy tổng quan quản trị thành công', await adminService.getOverview()); } catch (error) { next(error); }
};
export const getAdminAnalytics = async (_req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Lấy phân tích hệ thống thành công', await adminService.getAnalytics()); } catch (error) { next(error); }
};
export const listAdminUsers = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Lấy danh sách người dùng thành công', { users: await adminService.listUsers(typeof req.query.search === 'string' ? req.query.search : undefined) }); } catch (error) { next(error); }
};
export const createAdminUser = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Tạo tài khoản thành công', { user: await adminService.createUser(createUserSchema.parse(req.body)) }, 201); } catch (error) { next(error); }
};
export const updateAdminUserAccount = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Cập nhật tài khoản thành công', { user: await adminService.updateUserAccount(req.user!.userId, id(req), userAccountSchema.parse(req.body)) }); } catch (error) { next(error); }
};
export const updateAdminUserRole = updateAdminUserAccount;
export const updateAdminUserVerification = updateAdminUserAccount;
export const resetAdminUserPassword = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Đặt lại mật khẩu người dùng thành công', { user: await adminService.resetUserPassword(id(req), passwordSchema.parse(req.body).password) }); } catch (error) { next(error); }
};
export const deleteAdminUser = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Xóa người dùng thành công', await adminService.deleteUser(req.user!.userId, id(req))); } catch (error) { next(error); }
};

export const listTickets = async (_req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Lấy yêu cầu hỗ trợ thành công', { tickets: await adminService.listTickets() }); } catch (error) { next(error); }
};
export const createTicket = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Tạo yêu cầu hỗ trợ thành công', { ticket: await adminService.createTicket(ticketSchema.parse(req.body)) }, 201); } catch (error) { next(error); }
};
export const updateTicket = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Cập nhật yêu cầu hỗ trợ thành công', { ticket: await adminService.updateTicket(id(req), ticketUpdateSchema.parse(req.body)) }); } catch (error) { next(error); }
};

export const listConfigs = async (_req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Lấy cấu hình hệ thống thành công', { configs: await adminService.listConfigs() }); } catch (error) { next(error); }
};
export const upsertConfig = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Lưu cấu hình hệ thống thành công', { config: await adminService.upsertConfig(configSchema.parse(req.body)) }); } catch (error) { next(error); }
};
export const deleteConfig = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Xóa cấu hình thành công', await adminService.deleteConfig(id(req))); } catch (error) { next(error); }
};

export const listCategoryTemplates = async (_req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Lấy danh mục mẫu thành công', { templates: await adminService.listCategoryTemplates() }); } catch (error) { next(error); }
};
export const createCategoryTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Tạo danh mục mẫu thành công', { template: await adminService.createCategoryTemplate(templateSchema.parse(req.body)) }, 201); } catch (error) { next(error); }
};
export const updateCategoryTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Cập nhật danh mục mẫu thành công', { template: await adminService.updateCategoryTemplate(id(req), templateSchema.partial().parse(req.body)) }); } catch (error) { next(error); }
};
export const deleteCategoryTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Xóa danh mục mẫu thành công', await adminService.deleteCategoryTemplate(id(req))); } catch (error) { next(error); }
};

export const listCampaigns = async (_req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Lấy chiến dịch thông báo thành công', { campaigns: await adminService.listCampaigns() }); } catch (error) { next(error); }
};
export const createCampaign = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Tạo chiến dịch thông báo thành công', { campaign: await adminService.createCampaign(campaignSchema.parse(req.body)) }, 201); } catch (error) { next(error); }
};
export const sendCampaign = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Gửi thông báo thành công', { campaign: await adminService.sendCampaign(id(req)) }); } catch (error) { next(error); }
};

export const listContent = async (_req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Lấy nội dung quản trị thành công', { contents: await adminService.listContent() }); } catch (error) { next(error); }
};
export const createContent = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Tạo nội dung thành công', { content: await adminService.createContent(contentSchema.parse(req.body)) }, 201); } catch (error) { next(error); }
};
export const updateContent = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Cập nhật nội dung thành công', { content: await adminService.updateContent(id(req), contentSchema.partial().parse(req.body)) }); } catch (error) { next(error); }
};
export const deleteContent = async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, 'Xóa nội dung thành công', await adminService.deleteContent(id(req))); } catch (error) { next(error); }
};
