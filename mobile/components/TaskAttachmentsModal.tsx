import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
} from "react-native";
import Icon from "./Icon";
import {
  deleteTaskAttachment,
  getTaskAttachments,
  uploadTaskAttachment,
} from "../lib/taskApi";
import type { Task, TaskAttachment } from "../types/task";

interface TaskAttachmentsModalProps {
  task: Task | null;
  visible: boolean;
  onClose: () => void;
}

export default function TaskAttachmentsModal({
  task,
  visible,
  onClose,
}: TaskAttachmentsModalProps) {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task && visible) {
      loadAttachments();
    }
  }, [task, visible]);

  const loadAttachments = async () => {
    if (!task) return;
    setLoading(true);
    setError(null);
    try {
      const list = await getTaskAttachments(task._id);
      setAttachments(list);
    } catch (err) {
      console.warn("Failed to load attachments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePickFileWeb = () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
          const file = target.files[0];
          await uploadFile(file);
        }
      };
      input.click();
    } else {
      setError("File upload on native mobile requires Expo DocumentPicker");
    }
  };

  const uploadFile = async (file: File) => {
    if (!task) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const newAttachment = await uploadTaskAttachment(task._id, formData);
      setAttachments((prev) => [newAttachment, ...prev]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!task) return;
    try {
      await deleteTaskAttachment(task._id, attachmentId);
      setAttachments((prev) => prev.filter((a) => a._id !== attachmentId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete file");
    }
  };

  const getViewerUrl = (rawUrl?: string, filename?: string) => {
    if (!rawUrl) return "#";
    const nameToTest = filename || rawUrl.split("?")[0];
    const ext = nameToTest.split(".").pop()?.toLowerCase() || "";
    const docExtensions = ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"];

    if (docExtensions.includes(ext)) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}`;
    }
    return rawUrl;
  };

  const handleOpenLink = (rawUrl?: string, filename?: string) => {
    if (!rawUrl) return;
    const targetUrl = getViewerUrl(rawUrl, filename);
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.open(targetUrl, "_blank");
    } else {
      Linking.openURL(targetUrl).catch((e) =>
        console.warn("Could not open attachment link:", e)
      );
    }
  };

  if (!task) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Icon name="attach-outline" size={20} color="#111827" />
              <Text style={styles.title}>Task Attachments</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.taskTitle} numberOfLines={1}>
            Task: {task.title}
          </Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Upload Button */}
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={handlePickFileWeb}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.uploadBtnContent}>
                <Icon name="cloud-upload-outline" size={16} color="#FFFFFF" />
                <Text style={styles.uploadBtnText}>Upload File / Attachment</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* List of Attachments */}
          {loading ? (
            <ActivityIndicator style={{ marginVertical: 20 }} color="#111827" />
          ) : (
            <FlatList
              data={attachments}
              keyExtractor={(item) => item._id}
              style={styles.list}
              renderItem={({ item }) => {
                const rawUrl = item.url || item.fileUrl;

                return (
                  <View style={styles.itemCard}>
                    <TouchableOpacity
                      style={styles.itemInfo}
                      onPress={() => handleOpenLink(rawUrl, item.filename)}
                    >
                      <Icon name="document-text-outline" size={20} color="#2563EB" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.fileName} numberOfLines={1}>
                          {item.filename}
                        </Text>
                        <Text style={styles.fileMeta}>
                          {item.mimetype || item.fileType || "File"} • Tap to view
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(item._id)}
                    >
                      <Icon name="trash-outline" size={15} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No attachments uploaded yet.</Text>
              }
            />
          )}

          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  taskTitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 12,
  },
  closeBtn: {
    padding: 4,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginBottom: 8,
  },
  uploadBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 14,
  },
  uploadBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  uploadBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  list: {
    maxHeight: 220,
    marginVertical: 4,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  fileMeta: {
    fontSize: 10,
    color: "#6B7280",
  },
  deleteBtn: {
    padding: 8,
  },
  doneBtn: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  doneText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
