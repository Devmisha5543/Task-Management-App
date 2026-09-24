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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "./Icon";
import { addTaskMember, getTaskMembers, removeTaskMember } from "../lib/taskApi";
import type { Task, TaskMember } from "../types/task";

interface ShareTaskModalProps {
  task: Task | null;
  visible: boolean;
  onClose: () => void;
  onMembersUpdated: () => void;
}

export default function ShareTaskModal({
  task,
  visible,
  onClose,
  onMembersUpdated,
}: ShareTaskModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [members, setMembers] = useState<TaskMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task && visible) {
      loadMembers();
    }
  }, [task, visible]);

  const loadMembers = async () => {
    if (!task) return;
    setFetching(true);
    try {
      const list = await getTaskMembers(task._id);
      setMembers(list);
    } catch (err) {
      console.warn("Failed to load task members:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleAddMember = async () => {
    if (!email.trim() || !task) {
      setError("Email address is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addTaskMember(task._id, email.trim(), role);
      setEmail("");
      await loadMembers();
      onMembersUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!task) return;
    try {
      await removeTaskMember(task._id, userId);
      setMembers((prev) =>
        prev.filter((m) =>
          (typeof m.user === "string" ? m.user : m.user._id) !== userId
        )
      );
      onMembersUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    }
  };

  if (!task) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Icon name="people-outline" size={20} color="#111827" />
              <Text style={styles.title}>Share Task & Collaboration</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.taskTitle} numberOfLines={1}>
            Task: {task.title}
          </Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Add Member Form */}
          <View style={styles.addSection}>
            <Text style={styles.label}>Invite Team Member</Text>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="colleague@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleAddMember}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.addBtnText}>Invite</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.roleRow}>
              <Text style={styles.roleLabel}>Role:</Text>
              {(["editor", "viewer"] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.rolePill, role === r && styles.rolePillActive]}
                  onPress={() => setRole(r)}
                >
                  <Text
                    style={[
                      styles.rolePillText,
                      role === r && styles.rolePillTextActive,
                    ]}
                  >
                    {r.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Member List */}
          <Text style={styles.label}>Task Members ({members.length})</Text>

          {fetching ? (
            <ActivityIndicator style={{ marginVertical: 20 }} color="#111827" />
          ) : (
            <FlatList
              data={members}
              keyExtractor={(item, index) =>
                typeof item.user === "string"
                  ? item.user
                  : item.user._id || String(index)
              }
              style={styles.memberList}
              renderItem={({ item }) => {
                const isObj = typeof item.user !== "string";
                const username = isObj ? item.user.username : "User";
                const userEmail = isObj ? item.user.email : item.user;
                const userId = isObj ? item.user._id : item.user;

                return (
                  <View style={styles.memberItem}>
                    <View style={styles.memberInfo}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {username[0].toUpperCase()}
                        </Text>
                      </View>

                      <View>
                        <Text style={styles.memberName}>@{username}</Text>
                        <Text style={styles.memberEmail}>{userEmail}</Text>
                      </View>
                    </View>

                    <View style={styles.memberRight}>
                      <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>
                          {item.role.toUpperCase()}
                        </Text>
                      </View>

                      {item.role !== "owner" && (
                        <TouchableOpacity
                          style={styles.removeBtn}
                          onPress={() => handleRemoveMember(userId)}
                        >
                          <Icon name="trash-outline" size={14} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No collaborators added yet.</Text>
              }
            />
          )}

          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
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
  addSection: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: "#111827",
  },
  addBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
  },
  rolePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  rolePillActive: {
    backgroundColor: "#111827",
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4B5563",
  },
  rolePillTextActive: {
    color: "#FFFFFF",
  },
  memberList: {
    maxHeight: 180,
    marginVertical: 8,
  },
  memberItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
  memberName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  memberEmail: {
    fontSize: 11,
    color: "#6B7280",
  },
  memberRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roleBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4B5563",
  },
  removeBtn: {
    padding: 6,
  },
  emptyText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 16,
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
