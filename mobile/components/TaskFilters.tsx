import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";
import Icon from "./Icon";

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (p: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  viewMode: "list" | "kanban";
  onViewModeChange: (mode: "list" | "kanban") => void;
}

interface DropdownOption {
  id: string;
  label: string;
}

export default function TaskFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
}: TaskFiltersProps) {
  const [activeDropdown, setActiveDropdown] = useState<
    "status" | "priority" | "sort" | null
  >(null);

  const statusOptions: DropdownOption[] = [
    { id: "all", label: "All Statuses" },
    { id: "todo", label: "To Do" },
    { id: "in-progress", label: "In Progress" },
    { id: "done", label: "Completed" },
  ];

  const priorityOptions: DropdownOption[] = [
    { id: "all", label: "All Priorities" },
    { id: "high", label: "High Priority" },
    { id: "medium", label: "Medium Priority" },
    { id: "low", label: "Low Priority" },
  ];

  const sortOptions: DropdownOption[] = [
    { id: "newest", label: "Newest First" },
    { id: "oldest", label: "Oldest First" },
    { id: "priority-desc", label: "Highest Priority" },
    { id: "title-asc", label: "Title (A-Z)" },
  ];

  const getLabel = (options: DropdownOption[], currentId: string) => {
    const found = options.find((o) => o.id === currentId);
    return found ? found.label : currentId;
  };

  const currentOptions =
    activeDropdown === "status"
      ? statusOptions
      : activeDropdown === "priority"
      ? priorityOptions
      : activeDropdown === "sort"
      ? sortOptions
      : [];

  const currentSelectedId =
    activeDropdown === "status"
      ? statusFilter
      : activeDropdown === "priority"
      ? priorityFilter
      : activeDropdown === "sort"
      ? sortBy
      : "";

  const handleSelectOption = (id: string) => {
    if (activeDropdown === "status") onStatusFilterChange(id);
    if (activeDropdown === "priority") onPriorityFilterChange(id);
    if (activeDropdown === "sort") onSortByChange(id);
    setActiveDropdown(null);
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchRow}>
        <Icon name="search-outline" size={18} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery ? (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => onSearchChange("")}
          >
            <Icon name="close-circle" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* View Switcher & Filter Controls Row */}
      <View style={styles.controlsRow}>
        {/* View Mode Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              viewMode === "list" && styles.toggleBtnActive,
            ]}
            onPress={() => onViewModeChange("list")}
          >
            <Icon
              name="list-outline"
              size={15}
              color={viewMode === "list" ? "#111827" : "#6B7280"}
            />
            <Text
              style={[
                styles.toggleText,
                viewMode === "list" && styles.toggleTextActive,
              ]}
            >
              List
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              viewMode === "kanban" && styles.toggleBtnActive,
            ]}
            onPress={() => onViewModeChange("kanban")}
          >
            <Icon
              name="grid-outline"
              size={15}
              color={viewMode === "kanban" ? "#111827" : "#6B7280"}
            />
            <Text
              style={[
                styles.toggleText,
                viewMode === "kanban" && styles.toggleTextActive,
              ]}
            >
              Kanban
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Pickers Row */}
      <View style={styles.dropdownsRow}>
        {/* Status Dropdown */}
        <TouchableOpacity
          style={[
            styles.dropdownTrigger,
            statusFilter !== "all" && styles.dropdownTriggerActive,
          ]}
          onPress={() => setActiveDropdown("status")}
        >
          <Text
            style={[
              styles.dropdownValue,
              statusFilter !== "all" && styles.dropdownValueActive,
            ]}
            numberOfLines={1}
          >
            {getLabel(statusOptions, statusFilter)}
          </Text>
          <Icon name="chevron-down-outline" size={14} color="#6B7280" />
        </TouchableOpacity>

        {/* Priority Dropdown */}
        <TouchableOpacity
          style={[
            styles.dropdownTrigger,
            priorityFilter !== "all" && styles.dropdownTriggerActive,
          ]}
          onPress={() => setActiveDropdown("priority")}
        >
          <Text
            style={[
              styles.dropdownValue,
              priorityFilter !== "all" && styles.dropdownValueActive,
            ]}
            numberOfLines={1}
          >
            {getLabel(priorityOptions, priorityFilter)}
          </Text>
          <Icon name="chevron-down-outline" size={14} color="#6B7280" />
        </TouchableOpacity>

        {/* Sort Dropdown */}
        <TouchableOpacity
          style={styles.dropdownTrigger}
          onPress={() => setActiveDropdown("sort")}
        >
          <Text style={styles.dropdownValue} numberOfLines={1}>
            {getLabel(sortOptions, sortBy)}
          </Text>
          <Icon name="swap-vertical-outline" size={14} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Dropdown Options Modal */}
      <Modal
        visible={activeDropdown !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveDropdown(null)}
      >
        <TouchableWithoutFeedback onPress={() => setActiveDropdown(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownMenu}>
                <View style={styles.dropdownHeader}>
                  <Text style={styles.dropdownTitle}>
                    Select{" "}
                    {activeDropdown === "status"
                      ? "Status"
                      : activeDropdown === "priority"
                      ? "Priority"
                      : "Sort Order"}
                  </Text>
                  <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                    <Icon name="close-outline" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={currentOptions}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const isSelected = item.id === currentSelectedId;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.optionItem,
                          isSelected && styles.optionItemActive,
                        ]}
                        onPress={() => handleSelectOption(item.id)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                        {isSelected && (
                          <Icon
                            name="checkmark-outline"
                            size={16}
                            color="#2563EB"
                          />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    height: 38,
    fontSize: 13,
    color: "#111827",
  },
  clearBtn: {
    padding: 4,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
    padding: 3,
    alignSelf: "flex-start",
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  toggleBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  toggleTextActive: {
    color: "#111827",
  },
  dropdownsRow: {
    flexDirection: "row",
    gap: 8,
  },
  dropdownTrigger: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dropdownTriggerActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  dropdownValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
    flex: 1,
  },
  dropdownValueActive: {
    color: "#1D4ED8",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dropdownMenu: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    marginBottom: 6,
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  optionItemActive: {
    backgroundColor: "#EFF6FF",
  },
  optionText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  optionTextActive: {
    fontWeight: "700",
    color: "#2563EB",
  },
});
