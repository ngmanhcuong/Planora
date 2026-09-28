import { apiClient } from './axios';

export function notifyLocalActivity(
  entity: 'goal' | 'note' | 'category',
  action: 'create' | 'update' | 'delete' | 'status' | 'pin',
) {
  void apiClient.post('/notifications/activity', { entity, action }).catch(() => {
    window.alert('Thay đổi đã được thực hiện, nhưng không lưu được thông báo. Vui lòng kiểm tra kết nối.');
  });
}
