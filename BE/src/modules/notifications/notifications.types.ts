import { NotificationType } from '@prisma/client';

export interface NotificationResponse {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  isRead: boolean;
  readAt: Date | null;
  link: string | null;
  createdAt: Date;
}

export interface NotificationListQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType | string;
  search?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedNotificationsResponse {
  notifications: NotificationResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  link?: string | null;
}
