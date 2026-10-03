"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { deleteProfilePhoto, updateProfile, uploadProfilePhoto } from "@/lib/authApi";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";

import Icon from "@/components/ui/Icon";

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
    <div className="mx-auto max-w-2xl animate-in fade-in duration-200">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">User Profile</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-zinc-300">
          Update your profile details, avatar, and contact information.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-950/40 p-4 text-sm font-medium text-red-600 dark:text-red-300 border border-red-200 dark:border-red-900/60">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-xl bg-green-50 dark:bg-emerald-950/40 p-4 text-sm font-medium text-green-700 dark:text-emerald-300 border border-green-200 dark:border-emerald-900/60">
          {success}
        </div>
      )}

      {/* Main Profile Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
        {/* Cover Banner */}
        <div className="h-28 bg-linear-to-r from-zinc-800 via-zinc-900 to-black dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-950 border-b border-gray-200 dark:border-zinc-800"></div>

        {/* Profile Avatar & Header Actions */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 mb-6">
            <div className="flex items-end gap-4">
              {/* Clickable Profile Picture to Enlarge */}
              <div
                onClick={() => setIsPreviewOpen(true)}
                className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border-4 border-white dark:border-zinc-900 bg-gray-900 dark:bg-zinc-800 shadow-md flex items-center justify-center text-white text-2xl font-bold transition hover:opacity-90"
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
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-semibold text-white transition gap-1">
                  <Icon name="search" className="w-4 h-4" /> View
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user?.username || "Task Manager User"}
                </h2>
                <p className="text-sm font-medium text-gray-600 dark:text-zinc-300">{user?.email}</p>
              </div>
            </div>

            {/* Quick Upload Photo */}
            <div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-gray-800 dark:text-zinc-100 shadow-2xs hover:bg-gray-50 dark:hover:bg-zinc-700 transition">
                <Icon name="camera" className="w-4 h-4 text-gray-600 dark:text-zinc-300" />
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
          <form onSubmit={handleSaveProfile} className="space-y-4 border-t border-gray-100 dark:border-zinc-800 pt-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Edit Details</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-1.5">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. wamisha"
                className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-1.5">
                Phone Number <span className="text-xs text-gray-500 dark:text-zinc-400 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+251 91 234 5678"
                className="w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition shadow-2xs"
              />
              <p className="mt-1.5 text-xs text-gray-600 dark:text-zinc-300">
                Privacy controls for phone visibility will be available in future settings.
              </p>
            </div>

            <div className="flex justify-end pt-3">
              <Button type="submit" disabled={savingProfile} className="shadow-sm">
                {savingProfile ? "Saving..." : "Save Profile Changes"}
              </Button>
            </div>
          </form>

          {/* Subtle Fine-Print Joined Date */}
          {formattedDate && (
            <div className="mt-8 border-t border-gray-100 dark:border-zinc-800 pt-4 text-center">
              <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                Joined: {formattedDate}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Picture Enlarge Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-gray-900 dark:text-white">Profile Photo</h3>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-zinc-200 transition"
              >
                ✕
              </button>
            </div>

            {/* Enlarged Photo Container */}
            <div className="mt-4 flex justify-center">
              <div className="h-64 w-64 overflow-hidden rounded-2xl bg-gray-900 dark:bg-zinc-800 flex items-center justify-center text-white text-5xl font-bold shadow-inner">
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
            <div className="mt-6 flex flex-col gap-2.5">
              <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-black dark:bg-white py-2.5 text-sm font-semibold text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition shadow-sm">
                <Icon name="camera" className="w-4 h-4 text-white dark:text-black" />
                <span>Change Picture</span>
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
                  className="w-full rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition disabled:opacity-50"
                >
                  {deletingPhoto ? "Removing..." : "Remove Picture"}
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="mt-1 w-full rounded-xl border border-gray-300 dark:border-zinc-700 bg-transparent py-2 text-xs font-semibold text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
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
