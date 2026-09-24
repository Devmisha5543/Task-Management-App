import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Modal,
  Platform,
} from "react-native";
import Icon from "../components/Icon";
import {
  deleteProfilePhoto,
  updateProfile,
  uploadProfilePhoto,
} from "../lib/authApi";
import type { User } from "../types/auth";

interface ProfileScreenProps {
  user: User;
  onUserUpdated: (user: User) => void;
  onLogout: () => void;
}

export default function ProfileScreen({
  user,
  onUserUpdated,
  onLogout,
}: ProfileScreenProps) {
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setUsername(user.username || "");
    setEmail(user.email || "");
    setPhoneNumber(user.phoneNumber || "");
  }, [user]);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  const handlePickFileWeb = () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
          await handlePhotoUpload(target.files[0]);
        }
      };
      input.click();
    } else {
      setError("Image picker on native mobile requires Expo ImagePicker");
    }
  };

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const photoUrl = await uploadProfilePhoto(formData);
      onUserUpdated({ ...user, profilePhoto: photoUrl });
      setSuccess("Profile picture updated!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload photo");
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
      onUserUpdated({ ...user, profilePhoto: undefined });
      setSuccess("Profile photo removed.");
      setIsPreviewOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to remove photo");
    } finally {
      setDeletingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!username.trim() || !email.trim()) {
      setError("Username and Email are required");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateProfile({
        username: username.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      onUserUpdated(updated);
      setSuccess("Profile updated successfully!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>User Profile</Text>
      </View>

      {/* Avatar & Main Info */}
      <View style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={() => setIsPreviewOpen(true)}
          >
            {user.profilePhoto ? (
              <Image source={{ uri: user.profilePhoto }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>
                  {getInitials(user.username)}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.username}>@{user.username}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {formattedDate ? (
              <Text style={styles.joinedDate}>Joined: {formattedDate}</Text>
            ) : null}
          </View>
        </View>

        {/* Change Photo Button */}
        <TouchableOpacity
          style={styles.changePhotoBtn}
          onPress={handlePickFileWeb}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#111827" />
          ) : (
            <>
              <Icon name="cloud-upload-outline" size={15} color="#111827" />
              <Text style={styles.changePhotoText}>Change Profile Picture</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Success / Error Messages */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {success && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{success}</Text>
        </View>
      )}

      {/* Editable Form Card */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Edit Details</Text>

        <Text style={styles.label}>Username *</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="username"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Email Address *</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="email@example.com"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Phone Number (optional)</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="+251 91 234 5678"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSaveProfile}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Save Profile Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Logout Action */}
      <TouchableOpacity style={styles.logoutCard} onPress={onLogout}>
        <Icon name="log-out-outline" size={16} color="#EF4444" />
        <Text style={styles.logoutCardText}>Log Out of Account</Text>
      </TouchableOpacity>

      {/* Profile Picture Enlargement Modal */}
      <Modal visible={isPreviewOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.previewCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Photo</Text>
              <TouchableOpacity onPress={() => setIsPreviewOpen(false)}>
                <Icon name="close-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.largeAvatarContainer}>
              {user.profilePhoto ? (
                <Image
                  source={{ uri: user.profilePhoto }}
                  style={styles.largeAvatarImage}
                />
              ) : (
                <View style={styles.largeAvatarFallback}>
                  <Text style={styles.largeAvatarInitials}>
                    {getInitials(user.username)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalChangeBtn}
                onPress={() => {
                  setIsPreviewOpen(false);
                  handlePickFileWeb();
                }}
              >
                <Text style={styles.modalChangeText}>Change Picture</Text>
              </TouchableOpacity>

              {user.profilePhoto ? (
                <TouchableOpacity
                  style={styles.modalRemoveBtn}
                  onPress={handleRemovePhoto}
                  disabled={deletingPhoto}
                >
                  {deletingPhoto ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <Text style={styles.modalRemoveText}>Remove Picture</Text>
                  )}
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 16,
    paddingBottom: 90,
  },
  banner: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#111827",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111827",
  },
  avatarInitials: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  username: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  userEmail: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  joinedDate: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
  },
  changePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
  },
  successBox: {
    backgroundColor: "#D1FAE5",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  successText: {
    color: "#059669",
    fontSize: 13,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  saveBtn: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  logoutCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    paddingVertical: 12,
  },
  logoutCardText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  previewCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  largeAvatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  largeAvatarImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  largeAvatarFallback: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },
  largeAvatarInitials: {
    color: "#FFFFFF",
    fontSize: 50,
    fontWeight: "800",
  },
  modalActions: {
    gap: 10,
  },
  modalChangeBtn: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalChangeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  modalRemoveBtn: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  modalRemoveText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "700",
  },
});
