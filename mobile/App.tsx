import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from "react-native";
import { getAuthToken, mobileApiRequest, setAuthToken } from "./lib/api";
import type { User } from "./types/auth";
import AuthScreen from "./screens/AuthScreen";
import HomeScreen from "./screens/HomeScreen";
import SharedTasksScreen from "./screens/SharedTasksScreen";
import ProfileScreen from "./screens/ProfileScreen";
import Icon from "./components/Icon";

type TabType = "tasks" | "shared" | "profile";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>("tasks");

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
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#111827" />
        <StatusBar style="dark" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <AuthScreen onLoginSuccess={(u) => setUser(u)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Screen Render */}
      <View style={{ flex: 1 }}>
        {currentTab === "tasks" && (
          <HomeScreen
            user={user}
            onLogout={handleLogout}
            onNavigateToProfile={() => setCurrentTab("profile")}
          />
        )}
        {currentTab === "shared" && (
          <SharedTasksScreen
            user={user}
            onNavigateToProfile={() => setCurrentTab("profile")}
          />
        )}
        {currentTab === "profile" && (
          <ProfileScreen
            user={user}
            onUserUpdated={(updatedUser) => setUser(updatedUser)}
            onLogout={handleLogout}
          />
        )}
      </View>

      {/* Mobile Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab("tasks")}
        >
          <Icon
            name="list-outline"
            size={20}
            color={currentTab === "tasks" ? "#111827" : "#9CA3AF"}
          />
          <Text
            style={[
              styles.navText,
              currentTab === "tasks" && styles.navTextActive,
            ]}
          >
            All Tasks
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab("shared")}
        >
          <Icon
            name="people-outline"
            size={20}
            color={currentTab === "shared" ? "#111827" : "#9CA3AF"}
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

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab("profile")}
        >
          <Icon
            name="create-outline"
            size={20}
            color={currentTab === "profile" ? "#111827" : "#9CA3AF"}
          />
          <Text
            style={[
              styles.navText,
              currentTab === "profile" && styles.navTextActive,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  bottomBar: {
    flexDirection: "row",
    height: 60,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 4,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    flex: 1,
  },
  navText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  navTextActive: {
    color: "#111827",
    fontWeight: "800",
  },
});
