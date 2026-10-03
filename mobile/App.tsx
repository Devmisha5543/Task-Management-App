import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getAuthToken, mobileApiRequest, setAuthToken } from "./lib/api";
import type { User } from "./types/auth";
import AuthScreen from "./screens/AuthScreen";
import HomeScreen from "./screens/HomeScreen";
import MyTasksScreen from "./screens/MyTasksScreen";
import SharedTasksScreen from "./screens/SharedTasksScreen";
import CalendarScreen from "./screens/CalendarScreen";
import SettingsScreen from "./screens/SettingsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import Icon from "./components/Icon";
import { theme } from "./components/ui/theme";

type TabType = "dashboard" | "tasks" | "shared" | "calendar" | "settings";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>("dashboard");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const checkInitialAuth = async () => {
      try {
        const token = await getAuthToken();
        if (token) {
          const res = await mobileApiRequest("/auth/me");
          if (res.user) {
            setUser(res.user);
          }
        }
      } catch (err) {
        console.warn("Mobile initial auth check failed:", err);
        await setAuthToken(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkInitialAuth();
  }, []);

  const handleLogout = async () => {
    await setAuthToken(null);
    setUser(null);
  };

  if (checkingAuth) {
    return (
      <SafeAreaProvider>
        <View style={styles.splash}>
          <ActivityIndicator size="large" color={theme.colors.primary600} />
          <StatusBar style="dark" />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar style="dark" />
          <AuthScreen onLoginSuccess={(u) => setUser(u)} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="dark" />

        {/* Screen Render */}
        <View style={{ flex: 1 }}>
          {currentTab === "dashboard" && (
            <HomeScreen
              user={user}
              onLogout={handleLogout}
              onNavigateToProfile={() => setIsProfileOpen(true)}
              onNavigateToTasks={() => setCurrentTab("tasks")}
              onNavigateToShared={() => setCurrentTab("shared")}
              onNavigateToCalendar={() => setCurrentTab("calendar")}
              onNavigateToSettings={() => setCurrentTab("settings")}
            />
          )}

          {currentTab === "tasks" && (
            <MyTasksScreen
              user={user}
              onNavigateToProfile={() => setIsProfileOpen(true)}
            />
          )}

          {currentTab === "shared" && (
            <SharedTasksScreen
              user={user}
              onNavigateToProfile={() => setIsProfileOpen(true)}
            />
          )}

          {currentTab === "calendar" && (
            <CalendarScreen
              user={user}
              onNavigateToProfile={() => setIsProfileOpen(true)}
            />
          )}

          {currentTab === "settings" && (
            <SettingsScreen
              user={user}
              onLogout={handleLogout}
              onNavigateToProfile={() => setIsProfileOpen(true)}
            />
          )}
        </View>

        {/* Mobile Bottom Navigation Bar */}
        <View style={styles.bottomBar}>
          {/* 1. Dashboard */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCurrentTab("dashboard")}
            activeOpacity={0.7}
          >
            <Icon
              name="grid-outline"
              size={18}
              color={currentTab === "dashboard" ? theme.colors.primary600 : "#94A3B8"}
            />
            <Text
              style={[
                styles.navText,
                currentTab === "dashboard" && styles.navTextActive,
              ]}
            >
              Dashboard
            </Text>
          </TouchableOpacity>

          {/* 2. My Tasks */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCurrentTab("tasks")}
            activeOpacity={0.7}
          >
            <Icon
              name="list-outline"
              size={18}
              color={currentTab === "tasks" ? theme.colors.primary600 : "#94A3B8"}
            />
            <Text
              style={[
                styles.navText,
                currentTab === "tasks" && styles.navTextActive,
              ]}
            >
              My Tasks
            </Text>
          </TouchableOpacity>

          {/* 3. Shared */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCurrentTab("shared")}
            activeOpacity={0.7}
          >
            <Icon
              name="people-outline"
              size={18}
              color={currentTab === "shared" ? theme.colors.primary600 : "#94A3B8"}
            />
            <Text
              style={[
                styles.navText,
                currentTab === "shared" && styles.navTextActive,
              ]}
            >
              Shared
            </Text>
          </TouchableOpacity>

          {/* 4. Calendar */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCurrentTab("calendar")}
            activeOpacity={0.7}
          >
            <Icon
              name="calendar-outline"
              size={18}
              color={currentTab === "calendar" ? theme.colors.primary600 : "#94A3B8"}
            />
            <Text
              style={[
                styles.navText,
                currentTab === "calendar" && styles.navTextActive,
              ]}
            >
              Calendar
            </Text>
          </TouchableOpacity>

          {/* 5. Settings */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCurrentTab("settings")}
            activeOpacity={0.7}
          >
            <Icon
              name="create-outline"
              size={18}
              color={currentTab === "settings" ? theme.colors.primary600 : "#94A3B8"}
            />
            <Text
              style={[
                styles.navText,
                currentTab === "settings" && styles.navTextActive,
              ]}
            >
              Settings
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Modal */}
        <Modal
          visible={isProfileOpen}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsProfileOpen(false)}
        >
          <ProfileScreen
            user={user}
            onUserUpdated={(updatedUser) => setUser(updatedUser)}
            onLogout={handleLogout}
          />
        </Modal>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  bottomBar: {
    flexDirection: "row",
    height: 64,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: 8,
    paddingTop: 6,
    ...theme.shadows.md,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  navText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
  },
  navTextActive: {
    color: theme.colors.primary600,
    fontWeight: "800",
  },
});
