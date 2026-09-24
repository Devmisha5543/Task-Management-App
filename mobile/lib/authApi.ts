import { mobileApiRequest } from "./api";
import type { User } from "../types/auth";

export async function uploadProfilePhoto(formData: FormData): Promise<string> {
  const data = await mobileApiRequest("/auth/profile-photo", {
    method: "PUT",
    body: formData,
  });

  return data.profilePhoto;
}

export async function deleteProfilePhoto(): Promise<void> {
  await mobileApiRequest("/auth/profile-photo", {
    method: "DELETE",
  });
}

export async function updateProfile(data: {
  username?: string;
  email?: string;
  phoneNumber?: string;
}): Promise<User> {
  const res = await mobileApiRequest("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });

  return res.user;
}

export async function getMe(): Promise<User> {
  const data = await mobileApiRequest("/auth/me");
  return data.user;
}
