import { mobileApiRequest } from "./api";
import type { NotificationsResponse, NotificationItem } from "../types/notification";

export const getNotifications = async (): Promise<NotificationsResponse> => {
  return await mobileApiRequest("/notifications");
};

export const markNotificationRead = async (id: string): Promise<{ notification: NotificationItem }> => {
  return await mobileApiRequest(`/notifications/${id}/read`, {
    method: "PATCH",
  });
};

export const markAllNotificationsRead = async (): Promise<{ message: string }> => {
  return await mobileApiRequest("/notifications/read-all", {
    method: "PATCH",
  });
};

export const deleteNotification = async (id: string): Promise<{ message: string }> => {
  return await mobileApiRequest(`/notifications/${id}`, {
    method: "DELETE",
  });
};

export const clearAllNotifications = async (): Promise<{ message: string }> => {
  return await mobileApiRequest("/notifications", {
    method: "DELETE",
  });
};
