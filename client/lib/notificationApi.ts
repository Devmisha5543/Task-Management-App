import { apiRequest } from "@/lib/api";
import type { NotificationsResponse, NotificationItem } from "@/types/notification";

export const getNotifications = async (): Promise<NotificationsResponse> => {
  return (await apiRequest("/notifications")) as NotificationsResponse;
};

export const markNotificationRead = async (id: string): Promise<{ notification: NotificationItem }> => {
  return (await apiRequest(`/notifications/${id}/read`, {
    method: "PUT",
  })) as { notification: NotificationItem };
};

export const markAllNotificationsRead = async (): Promise<{ message: string }> => {
  return (await apiRequest("/notifications/read-all", {
    method: "PUT",
  })) as { message: string };
};

export const deleteNotification = async (id: string): Promise<{ message: string }> => {
  return (await apiRequest(`/notifications/${id}`, {
    method: "DELETE",
  })) as { message: string };
};

export const clearAllNotifications = async (): Promise<{ message: string }> => {
  return (await apiRequest("/notifications/clear-all", {
    method: "DELETE",
  })) as { message: string };
};
