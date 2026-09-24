"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { deleteProfilePhoto, updateProfile, uploadProfilePhoto } from "@/lib/authApi";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const updateProfilePhotoInStore = useAuthStore((state) => state.updateProfilePhoto);
  const updateUserInStore = useAuthStore((state) => state.updateUser);

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // UI modal / loading states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phoneNumber || "");
    }
  }, [user]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP)");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const newPhotoUrl = await uploadProfilePhoto(file);
      updateProfilePhotoInStore(newPhotoUrl);
      setSuccess("Profile photo updated successfully!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to upload profile photo");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setDeletingPhoto(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteProfilePhoto();
      updateProfilePhotoInStore(null);
      setSuccess("Profile photo removed.");
      setIsPreviewOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to remove profile photo");
      }
    } finally {
      setDeletingPhoto(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      setError("Username and Email are required");
      return;
    }

    setSavingProfile(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedUser = await updateProfile({
        username: username.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      updateUserInStore(updatedUser);
      setSuccess("Profile information updated successfully!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update profile");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update your profile details, avatar, and contact information.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm text-green-600 border border-green-200">
          {success}
        </div>
      )}

      {/* Main Profile Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Cover Banner */}
        <div className="h-28 bg-linear-to-r from-gray-900 via-gray-800 to-black"></div>

        {/* Profile Avatar & Header Actions */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 mb-6">
            <div className="flex items-end gap-4">
              {/* Clickable Profile Picture to Enlarge */}
              <div
                onClick={() => setIsPreviewOpen(true)}
                className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border-4 border-white bg-gray-900 shadow-md flex items-center justify-center text-white text-2xl font-bold transition hover:opacity-90"
                title="Click to view larger profile photo"
              >
                {user?.profilePhoto ? (
                  <Image
                    src={user.profilePhoto}
                    alt={user.username || "Profile"}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span>{getInitials(user?.username)}</span>
                )}
                {/* Hover overlay indicator */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-semibold text-white transition">
                  🔍 View
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user?.username || "Task Manager User"}
                </h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* Quick Upload Photo */}
            <div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 shadow-2xs hover:bg-gray-50">
                <span>📷</span>
                <span>{uploading ? "Uploading..." : "Change Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Editable Profile Information Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4 border-t pt-6">
            <h3 className="text-base font-semibold text-gray-900">Edit Details</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. wamisha"
                className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-xs text-gray-500">(optional)</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+251 91 234 5678"
                className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-black focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-400">
                Privacy controls for phone visibility will be available in future settings.
              </p>
            </div>

            <div className="flex justify-end pt-3">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save Profile Changes"}
              </Button>
            </div>
          </form>

          {/* Subtle Fine-Print Joined Date */}
          {formattedDate && (
            <div className="mt-8 border-t pt-4 text-center">
              <span className="text-xs text-gray-400">
                Joined: {formattedDate}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Picture Enlarge Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900">Profile Photo</h3>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Enlarged Photo Container */}
            <div className="mt-4 flex justify-center">
              <div className="h-64 w-64 overflow-hidden rounded-2xl bg-gray-900 flex items-center justify-center text-white text-5xl font-bold shadow-inner">
                {user?.profilePhoto ? (
                  <Image
                    src={user.profilePhoto}
                    alt={user.username || "Profile"}
                    width={256}
                    height={256}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span>{getInitials(user?.username)}</span>
                )}
              </div>
            </div>

            {/* Actions inside Modal */}
            <div className="mt-6 flex flex-col gap-2">
              <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-black py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition">
                <span>📷 Change Picture</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => {
                    handlePhotoUpload(e);
                    setIsPreviewOpen(false);
                  }}
                  className="hidden"
                />
              </label>

              {user?.profilePhoto && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={deletingPhoto}
                  className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                >
                  {deletingPhoto ? "Removing..." : "Remove Picture"}
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="mt-1 w-full rounded-xl border border-gray-300 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
