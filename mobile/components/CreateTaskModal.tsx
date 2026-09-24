import React, { useState } from "react";
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
import type { CreateTaskData } from "../types/task";

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskData) => Promise<void>;
}

export default function CreateTaskModal({
  visible,
  onClose,
  onSubmit,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">("todo");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [labels, setLabels] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const labelArray = labels
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);

      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        labels: labelArray,
      });

      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setLabels("");
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create task");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Icon name="add" size={20} color="#111827" />
              <Text style={styles.headerTitle}>New Task</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Task title..."
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add task details..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Initial Status</Text>
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

            <Text style={styles.label}>Labels (comma separated)</Text>
            <TextInput
              style={styles.input}
              value={labels}
              onChangeText={setLabels}
              placeholder="bug, feature, urgent"
              placeholderTextColor="#9CA3AF"
            />
          </ScrollView>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.submitText}>Create Task</Text>
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
  content: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
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
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  textArea: {
    height: 70,
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
  btnRow: {
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
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
