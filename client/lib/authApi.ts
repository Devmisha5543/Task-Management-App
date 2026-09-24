import { apiRequest } from "@/lib/api";
import type { User } from "@/types/auth";

export async function uploadProfilePhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const data = await apiRequest("/auth/profile-photo", {
    method: "PUT",
    body: formData,
  });

  return data.profilePhoto;
}

export async function deleteProfilePhoto(): Promise<void> {
  await apiRequest("/auth/profile-photo", {
    method: "DELETE",
  });
}

export async function updateProfile(data: {
  username?: string;
  email?: string;
  phoneNumber?: string;
}): Promise<User> {
  const res = await apiRequest("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });

  return res.user;
}

export async function getMe(): Promise<User> {
  const data = await apiRequest("/auth/me");
  return data.user;
}
