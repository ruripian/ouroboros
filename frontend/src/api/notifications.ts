import { api } from "@/lib/axios";
import type { Notification } from "@/types";

export const notificationsApi = {
  /** 알림 목록 (최신순 50개) */
  list: (workspaceSlug: string) =>
    api
      .get<{ results: Notification[] }>(`/workspaces/${workspaceSlug}/notifications/`)
      .then((r) => r.data.results),

  /** 미읽음 알림 수 */
  unreadCount: (workspaceSlug: string) =>
    api
      .get<{ count: number }>(`/workspaces/${workspaceSlug}/notifications/unread-count/`)
      .then((r) => r.data.count),

  /** 개별 알림 읽음 처리 */
  markAsRead: (workspaceSlug: string, id: string) =>
    api.patch(`/workspaces/${workspaceSlug}/notifications/${id}/read/`),

  /** 전체 읽음 처리 */
  markAllAsRead: (workspaceSlug: string) =>
    api.post(`/workspaces/${workspaceSlug}/notifications/read-all/`),
};
