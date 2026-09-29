import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  }

  let host = "192.168.1.6";

  if (Platform.OS === "web") {
    host =
      typeof window !== "undefined" && window.location.hostname
        ? window.location.hostname
        : "localhost";
  } else {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any).manifest?.debuggerHost ||
      (Constants as any).manifest2?.extra?.expoGo?.developer?.tool ||
      (Constants as any).experienceUrl;

    if (hostUri && typeof hostUri === "string") {
      const extracted = hostUri.replace("exp://", "").split(":")[0];
      if (extracted && extracted !== "localhost" && extracted !== "127.0.0.1") {
        host = extracted;
      }
    } else if (Platform.OS === "android" && !Constants.isDevice) {
      // Standard Android emulator loopback alias to host machine
      host = "10.0.2.2";
    }
  }

  return `http://${host}:5001/api`;
};

export const API_URL = getBaseUrl();

let inMemoryToken: string | null = null;

export const setAuthToken = async (token: string | null) => {
  inMemoryToken = token;
  try {
    if (token) {
      await AsyncStorage.setItem("user_token", token);
    } else {
      await AsyncStorage.removeItem("user_token");
    }
  } catch (e) {
    console.warn("AsyncStorage not available, using memory token", e);
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  if (inMemoryToken) return inMemoryToken;
  try {
    const token = await AsyncStorage.getItem("user_token");
    if (token) inMemoryToken = token;
    return token;
  } catch (e) {
    return inMemoryToken;
  }
};

export async function mobileApiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = await getAuthToken();

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    console.error(`Network fetch failed for ${API_URL}${endpoint}:`, netErr);
    throw new Error(
      `Cannot connect to backend (${API_URL}). Ensure server is running and accessible on your Wi-Fi network.`
    );
  }

  const textData = await response.text();
  let data: any = {};

  try {
    data = textData ? JSON.parse(textData) : {};
  } catch (e) {
    console.warn("Non-JSON API response received:", textData);
    throw new Error(
      `Server error (${response.status}). Ensure backend API is running at ${API_URL}`
    );
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}
