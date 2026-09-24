import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Dynamic API URL: 192.168.1.6 for physical mobile devices on Wi-Fi, localhost for Web
export const API_URL =
  Platform.OS === "web"
    ? "http://localhost:5000/api"
    : "http://192.168.1.6:5000/api";

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

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const errorText = await response.text();
    console.warn("Non-JSON API response received:", errorText);
    throw new Error(`Server error (${response.status}). Ensure backend API is running at ${API_URL}`);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
