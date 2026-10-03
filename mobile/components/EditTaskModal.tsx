import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "./Icon";
import { updateTask } from "../lib/taskApi";
import type { CreateTaskData, Subtask, Task } from "../types/task";

interface EditTaskModalProps {
  task: Task | null;
  visible?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  onSubmit?: (id: string, data: Partial<CreateTaskData>) => Promise<void>;
  onUpdate?: (id: string, updates: Partial<CreateTaskData>) => Promise<void>;
  onUpdated?: (updated: Task) => void;
  availableTasks?: Task[];
}

export default function EditTaskModal({
  task,
  visible,
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  onUpdated,
  availableTasks = [],
}: EditTaskModalProps) {
  const isModalVisible = Boolean((visible ?? isOpen ?? (task !== null)) && task !== null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">("todo");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [recurrence, setRecurrence] = useState<"none" | "daily" | "weekly" | "monthly">("none");
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [labels, setLabels] = useState("");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
      setRecurrence(task.recurrence || (task.isRecurring ? "daily" : "none"));
      const depIds = (task.dependencies || []).map((d) =>
        typeof d === "string" ? d : d._id
      );
      setSelectedDependencies(depIds);
      setLabels(task.labels ? task.labels.join(", ") : "");
      setSubtasks(task.subtasks ? [...task.subtasks] : []);
      setNewSubtaskTitle("");
      setError(null);
    }
  }, [task]);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle("");
  };

  const handleToggleSubtask = (index: number) => {
    setSubtasks(
      subtasks.map((item, i) =>
        i === index
          ? {
              ...item,
              completed: !item.completed,
              completedAt: !item.completed ? new Date().toISOString() : null,
            }
          : item
      )
    );
  };

  const handleDeleteSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!task) return;

    setLoading(true);
    setError(null);

    try {
      const labelArray = labels
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);

      const submitHandler = onSubmit || onUpdate;
      const payload: Partial<CreateTaskData> = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        labels: labelArray,
        subtasks,
        isRecurring: recurrence !== "none",
        recurrence,
        dependencies: selectedDependencies,
      };

      if (submitHandler) {
        await submitHandler(task._id, payload);
      } else if (onUpdated) {
        const updated = await updateTask(task._id, payload);
        onUpdated(updated);
      }

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  if (!task) return null;

  return (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Icon name="create-outline" size={20} color="#111827" />
              <Text style={styles.title}>Edit Task</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Task title"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Task details..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Status</Text>
            <View style={styles.optionRow}>
              {(["todo", "in-progress", "done"] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.optionBtn,
                    status === s && styles.optionBtnActive,
                  ]}
                  onPress={() => setStatus(s)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      status === s && styles.optionTextActive,
                    ]}
                  >
                    {s === "in-progress" ? "In Progress" : s.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Priority</Text>
            <View style={styles.optionRow}>
              {(["low", "medium", "high"] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.optionBtn,
                    priority === p && styles.optionBtnActive,
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      priority === p && styles.optionTextActive,
                    ]}
                  >
                    {p.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
            <View style={styles.datePresetRow}>
              <TouchableOpacity
                style={styles.datePresetBtn}
                onPress={() => {
                  const d = new Date();
                  setDueDate(d.toISOString().split("T")[0]);
                }}
              >
                <Text style={styles.datePresetText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.datePresetBtn}
                onPress={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  setDueDate(d.toISOString().split("T")[0]);
                }}
              >
                <Text style={styles.datePresetText}>Tomorrow</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.datePresetBtn}
                onPress={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 7);
                  setDueDate(d.toISOString().split("T")[0]);
                }}
              >
                <Text style={styles.datePresetText}>Next Week</Text>
              </TouchableOpacity>
              {dueDate ? (
                <TouchableOpacity
                  style={[styles.datePresetBtn, { backgroundColor: "#FEE2E2" }]}
                  onPress={() => setDueDate("")}
                >
                  <Text style={[styles.datePresetText, { color: "#DC2626" }]}>Clear</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <TextInput
              style={styles.input}
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="e.g. 2026-10-15"
              placeholderTextColor="#9CA3AF"
            />

            {/* Recurrence Selection */}
            <Text style={styles.label}>Recurrence (Auto-spawns next cycle)</Text>
            <View style={styles.optionRow}>
              {(["none", "daily", "weekly", "monthly"] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.optionBtn,
                    recurrence === r && styles.optionBtnActive,
                  ]}
                  onPress={() => setRecurrence(r)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      recurrence === r && styles.optionTextActive,
                    ]}
                  >
                    {r.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Task Dependencies / Prerequisites */}
            <Text style={styles.label}>
              Prerequisites & Dependencies{" "}
              {selectedDependencies.length > 0 ? `(${selectedDependencies.length} selected)` : ""}
            </Text>
            {availableTasks.filter((t) => t._id !== task._id).length === 0 ? (
              <Text style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic", marginBottom: 12 }}>
                No other tasks in workspace to select as prerequisites.
              </Text>
            ) : (
              <View style={{ maxHeight: 120, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, padding: 8, marginBottom: 14 }}>
                <ScrollView nestedScrollEnabled>
                  {availableTasks
                    .filter((t) => t._id !== task._id)
                    .map((t) => {
                      const isChecked = selectedDependencies.includes(t._id);
                      return (
                        <TouchableOpacity
                          key={t._id}
                          onPress={() => {
                            if (isChecked) {
                              setSelectedDependencies(selectedDependencies.filter((id) => id !== t._id));
                            } else {
                              setSelectedDependencies([...selectedDependencies, t._id]);
                            }
                          }}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingVertical: 5,
                          }}
                        >
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
                            <Icon
                              name={isChecked ? "checkmark-outline" : "checkbox-outline"}
                              size={16}
                              color={isChecked ? "#2563eb" : "#9ca3af"}
                            />
                            <Text
                              numberOfLines={1}
                              style={{
                                fontSize: 12,
                                color: isChecked ? "#111827" : "#4b5563",
                                fontWeight: isChecked ? "600" : "400",
                              }}
                            >
                              {t.title}
                            </Text>
                          </View>
                          <Text style={{ fontSize: 10, color: t.status === "done" ? "#16a34a" : "#6b7280" }}>
                            {t.status}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </ScrollView>
              </View>
            )}

            <Text style={styles.label}>Labels (comma separated)</Text>
            <TextInput
              style={styles.input}
              value={labels}
              onChangeText={setLabels}
              placeholder="bug, feature, urgent"
              placeholderTextColor="#9CA3AF"
            />

            {/* Checklist / Subtasks Section */}
            <View style={styles.checklistSection}>
              <View style={styles.checklistHeader}>
                <View style={styles.checklistTitleRow}>
                  <Icon
                    name="checkbox-outline"
                    size={16}
                    color={
                      completedSubtasks === totalSubtasks && totalSubtasks > 0
                        ? "#059669"
                        : "#2563EB"
                    }
                  />
                  <Text style={styles.checklistTitle}>
                    Checklist {totalSubtasks > 0 ? `(${completedSubtasks}/${totalSubtasks})` : ""}
                  </Text>
                </View>
                {totalSubtasks > 0 ? (
                  <Text
                    style={[
                      styles.checklistPercent,
                      {
                        color:
                          completedSubtasks === totalSubtasks
                            ? "#059669"
                            : "#2563EB",
                      },
                    ]}
                  >
                    {subtaskProgress}%
                  </Text>
                ) : null}
              </View>

              {totalSubtasks > 0 ? (
                <View style={styles.checklistProgressBarBg}>
                  <View
                    style={[
                      styles.checklistProgressBarFill,
                      {
                        width: `${subtaskProgress}%`,
                        backgroundColor:
                          completedSubtasks === totalSubtasks
                            ? "#10B981"
                            : "#3B82F6",
                      },
                    ]}
                  />
                </View>
              ) : null}

              {/* Subtask Items */}
              {totalSubtasks > 0 ? (
                <View style={styles.checklistItemsList}>
                  {subtasks.map((item, idx) => (
                    <View key={idx} style={styles.checklistItemRow}>
                      <TouchableOpacity
                        style={styles.checkboxTouchable}
                        onPress={() => handleToggleSubtask(idx)}
                      >
                        <View
                          style={[
                            styles.checkboxBox,
                            item.completed && styles.checkboxBoxChecked,
                          ]}
                        >
                          {item.completed ? (
                            <Icon name="checkmark-outline" size={12} color="#FFFFFF" />
                          ) : null}
                        </View>
                        <Text
                          style={[
                            styles.checklistItemText,
                            item.completed && styles.checklistItemTextCompleted,
                          ]}
                        >
                          {item.title}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDeleteSubtask(idx)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Icon name="close-circle" size={16} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Add Subtask Input */}
              <View style={styles.subtaskInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={newSubtaskTitle}
                  onChangeText={setNewSubtaskTitle}
                  placeholder="Add checklist item..."
                  placeholderTextColor="#9CA3AF"
                  onSubmitEditing={handleAddSubtask}
                  returnKeyType="done"
                />
                <TouchableOpacity style={styles.addSubtaskBtn} onPress={handleAddSubtask}>
                  <Text style={styles.addSubtaskBtnText}>+ Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitText}>Save Changes</Text>
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
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginBottom: 16,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
    marginTop: 10,
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
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  optionRow: {
    flexDirection: "row",
    gap: 8,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  optionBtnActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  optionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4B5563",
  },
  optionTextActive: {
    color: "#FFFFFF",
  },
  datePresetRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  datePresetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  datePresetText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#111827",
    alignItems: "center",
  },
  submitText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  checklistSection: {
    marginTop: 14,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  checklistHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checklistTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  checklistTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
  },
  checklistPercent: {
    fontSize: 12,
    fontWeight: "800",
  },
  checklistProgressBarBg: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 8,
  },
  checklistProgressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  checklistItemsList: {
    marginTop: 10,
    gap: 6,
    maxHeight: 180,
  },
  checklistItemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  checkboxTouchable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#9CA3AF",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxBoxChecked: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  checklistItemText: {
    flex: 1,
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "500",
  },
  checklistItemTextCompleted: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  subtaskInputRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  addSubtaskBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addSubtaskBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
