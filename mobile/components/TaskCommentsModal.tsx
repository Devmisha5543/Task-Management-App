import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "./Icon";
import { addComment, deleteComment, getTaskComments } from "../lib/taskApi";
import type { Task, TaskComment } from "../types/task";

interface TaskCommentsModalProps {
  task: Task | null;
  visible: boolean;
  onClose: () => void;
  onCommentChange?: () => void;
}

export default function TaskCommentsModal({
  task,
  visible,
  onClose,
  onCommentChange,
}: TaskCommentsModalProps) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task && visible) {
      loadComments();
    }
  }, [task, visible]);

  const loadComments = async () => {
    if (!task) return;
    setLoading(true);
    setError(null);
    try {
      const list = await getTaskComments(task._id);
      setComments(list);
    } catch (err: unknown) {
      console.warn("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!task || !text.trim() || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const newComment = await addComment(task._id, text.trim());
      setComments((prev) => [...prev, newComment]);
      setText("");
      if (onCommentChange) onCommentChange();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!task) return;
    try {
      await deleteComment(task._id, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      if (onCommentChange) onCommentChange();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete comment");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  if (!task) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Icon name="chatbubble-outline" size={20} color="#111827" />
              <Text style={styles.title}>Discussion & Notes</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.taskTitle} numberOfLines={1}>
            Task: {task.title}
          </Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* List of Comments */}
          {loading ? (
            <ActivityIndicator style={{ marginVertical: 24 }} color="#111827" />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item._id}
              style={styles.list}
              contentContainerStyle={{ paddingVertical: 4 }}
              renderItem={({ item }) => {
                const username =
                  item.user?.username || item.user?.email || "User";
                const avatar = item.user?.profileImage;

                return (
                  <View style={styles.commentCard}>
                    {avatar ? (
                      <Image
                        source={{ uri: avatar }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarLetter}>
                          {username.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}

                    <View style={styles.commentBody}>
                      <View style={styles.commentHeaderRow}>
                        <Text style={styles.commentAuthor}>{username}</Text>
                        <View style={styles.rightHeaderRow}>
                          <Text style={styles.commentTime}>
                            {formatDate(item.createdAt)}
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleDelete(item._id)}
                            style={{ marginLeft: 6 }}
                          >
                            <Icon name="trash-outline" size={14} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.commentText}>{item.text}</Text>
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No comments yet. Start the conversation below!
                  </Text>
                </View>
              }
            />
          )}

          {/* Input Row */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Write a comment..."
              value={text}
              onChangeText={setText}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!text.trim() || submitting) && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!text.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Icon name="send-outline" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: "85%",
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
  list: {
    maxHeight: 260,
    marginBottom: 12,
  },
  commentCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 10,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  commentBody: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  commentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  rightHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentTime: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  commentText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    pt: 12,
    paddingTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: "#111827",
  },
  sendBtn: {
    backgroundColor: "#2563EB",
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#93C5FD",
  },
});
