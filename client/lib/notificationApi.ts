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

export interface NotificationPreferences {
  emailPreferences: {
    deadlineAlerts: boolean;
    taskAssignments: boolean;
    comments: boolean;
    weeklyDigest: boolean;
  };
  pushPreferences: {
    deadlineAlerts: boolean;
    taskAssignments: boolean;
    comments: boolean;
  };
  registeredDevicesCount: number;
  email: string;
}

export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  return (await apiRequest("/auth/notification-preferences")) as NotificationPreferences;
};

export const updateNotificationPreferences = async (prefs: {
  emailPreferences?: Partial<NotificationPreferences["emailPreferences"]>;
  pushPreferences?: Partial<NotificationPreferences["pushPreferences"]>;
}): Promise<{ message: string; emailPreferences: any; pushPreferences: any }> => {
  return (await apiRequest("/auth/notification-preferences", {
    method: "PUT",
    body: JSON.stringify(prefs),
  })) as { message: string; emailPreferences: any; pushPreferences: any };
};

export const sendTestEmail = async (): Promise<{ message: string; previewUrl?: string }> => {
  return (await apiRequest("/auth/test-email", {
    method: "POST",
  })) as { message: string; previewUrl?: string };
};

export const sendTestPush = async (): Promise<{ message: string; result?: any }> => {
  return (await apiRequest("/auth/test-push", {
    method: "POST",
  })) as { message: string; result?: any };
};

