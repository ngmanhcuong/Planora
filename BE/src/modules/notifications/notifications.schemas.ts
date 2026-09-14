import { z } from 'zod';
import { NotificationType } from '@prisma/client';

export const notificationListQuerySchema = z.object({
  page: z.preprocess((val) => (val ? Number(val) : 1), z.number().min(1).default(1)),
  limit: z.preprocess((val) => (val ? Number(val) : 20), z.number().min(1).max(100).default(20)),
  isRead: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : undefined),
    z.boolean().optional()
  ),
  type: z.string().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type NotificationListQueryInput = z.infer<typeof notificationListQuerySchema>;
