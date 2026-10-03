import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../components/Icon";
import type { User } from "../types/auth";
import { theme } from "../components/ui/theme";

interface SettingsScreenProps {
  user: User;
  onLogout: () => void;
  onNavigateToProfile: () => void;
}

export default function SettingsScreen({
  user,
  onLogout,
  onNavigateToProfile,
}: SettingsScreenProps) {
  // Settings States
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [defaultView, setDefaultView] = useState<"list" | "kanban">("list");
  const [pushNotifs, setPushNotifs] = useState(true);
  const [dueReminders, setDueReminders] = useState(true);
  const [teamUpdates, setTeamUpdates] = useState(true);

  const handleLogoutConfirm = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of TaskFlow on this device?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: onLogout },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>
            Manage preferences, display, notifications & account
          </Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileLeft}>
            <View style={styles.avatarContainer}>
              {user.profilePhoto ? (
                <Image
                  source={{ uri: user.profilePhoto }}
                  style={styles.avatarImg}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {user.username ? user.username.slice(0, 2).toUpperCase() : "U"}
                </Text>
              )}
            </View>
            <View style={styles.profileMeta}>
              <Text style={styles.profileName}>{user.name || user.username}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusPillText}>Active Account</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={onNavigateToProfile}
            activeOpacity={0.7}
          >
            <Text style={styles.editProfileBtnText}>Edit</Text>
            <Icon name="create-outline" size={14} color={theme.colors.primary600} />
          </TouchableOpacity>
        </View>

        {/* Section 1: Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Appearance &amp; Display</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowIconWrapper}>
                <Icon name="search-outline" size={18} color="#0F172A" />
              </View>
              <View style={styles.rowMeta}>
                <Text style={styles.rowTitle}>Dark Mode</Text>
                <Text style={styles.rowDesc}>Switch between light and dark themes</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                trackColor={{ false: "#E2E8F0", true: theme.colors.primary500 }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowIconWrapper}>
                <Icon name="grid-outline" size={18} color="#0F172A" />
              </View>
              <View style={styles.rowMeta}>
                <Text style={styles.rowTitle}>Default Task View</Text>
                <Text style={styles.rowDesc}>Preferred layout when opening tasks</Text>
              </View>
              <View style={styles.segmentedToggle}>
                <TouchableOpacity
                  style={[
                    styles.segmentBtn,
                    defaultView === "list" && styles.segmentBtnActive,
                  ]}
                  onPress={() => setDefaultView("list")}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      defaultView === "list" && styles.segmentTextActive,
                    ]}
                  >
                    List
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.segmentBtn,
                    defaultView === "kanban" && styles.segmentBtnActive,
                  ]}
                  onPress={() => setDefaultView("kanban")}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      defaultView === "kanban" && styles.segmentTextActive,
                    ]}
                  >
                    Kanban
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Section 2: Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Notifications</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowIconWrapper}>
                <Icon name="notifications-outline" size={18} color="#0F172A" />
              </View>
              <View style={styles.rowMeta}>
                <Text style={styles.rowTitle}>Push Notifications</Text>
                <Text style={styles.rowDesc}>Receive alert badges &amp; banner updates</Text>
              </View>
              <Switch
                value={pushNotifs}
                onValueChange={setPushNotifs}
                trackColor={{ false: "#E2E8F0", true: theme.colors.primary500 }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowIconWrapper}>
                <Icon name="time-outline" size={18} color="#0F172A" />
              </View>
              <View style={styles.rowMeta}>
                <Text style={styles.rowTitle}>Due Date Reminders</Text>
                <Text style={styles.rowDesc}>Alert before upcoming deadlines</Text>
              </View>
              <Switch
                value={dueReminders}
                onValueChange={setDueReminders}
                trackColor={{ false: "#E2E8F0", true: theme.colors.primary500 }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowIconWrapper}>
                <Icon name="people-outline" size={18} color="#0F172A" />
              </View>
              <View style={styles.rowMeta}>
                <Text style={styles.rowTitle}>Team Activity</Text>
                <Text style={styles.rowDesc}>Notifications when team members share tasks</Text>
              </View>
              <Switch
                value={teamUpdates}
                onValueChange={setTeamUpdates}
                trackColor={{ false: "#E2E8F0", true: theme.colors.primary500 }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Section 3: App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>About TaskFlow</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App Version</Text>
              <Text style={styles.infoValue}>1.0.0 (Expo Mobile)</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>API Server Status</Text>
              <View style={styles.serverStatusWrapper}>
                <View style={styles.serverStatusDot} />
                <Text style={styles.serverStatusText}>Connected (Port 5001)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 4: Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutCard}
            onPress={handleLogoutConfirm}
            activeOpacity={0.8}
          >
            <Icon name="log-out-outline" size={18} color="#DC2626" />
            <Text style={styles.logoutCardText}>Log Out of TaskFlow</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.copyrightText}>
          TaskFlow v1.0.0 • Mobile &amp; Desktop Synced
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 18,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 20,
    ...theme.shadows.sm,
  },
  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary50,
    borderWidth: 1.5,
    borderColor: theme.colors.primary100,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.primary600,
  },
  profileMeta: {
    gap: 2,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  profileEmail: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.success,
  },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.primary50,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.radii.md,
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary600,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 6,
    ...theme.shadows.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowMeta: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  rowDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
  },
  segmentedToggle: {
    flexDirection: "row",
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radii.sm,
    padding: 3,
  },
  segmentBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radii.sm - 2,
  },
  segmentBtnActive: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  segmentTextActive: {
    color: theme.colors.textPrimary,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  serverStatusWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  serverStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
  },
  serverStatusText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.success,
  },
  logoutCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.colors.dangerLight,
    borderWidth: 1,
    borderColor: theme.colors.dangerBorder,
    paddingVertical: 14,
    borderRadius: theme.radii.xl,
  },
  logoutCardText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.danger,
  },
  copyrightText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginTop: 8,
  },
});
