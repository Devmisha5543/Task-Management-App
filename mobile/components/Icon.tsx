import React from "react";
import { View, Text } from "react-native";

export type IconName =
  | "search-outline"
  | "close-circle"
  | "close-outline"
  | "list-outline"
  | "grid-outline"
  | "chevron-down-outline"
  | "swap-vertical-outline"
  | "checkmark-outline"
  | "people-outline"
  | "person-add-outline"
  | "attach-outline"
  | "document-text-outline"
  | "cloud-upload-outline"
  | "folder-open-outline"
  | "create-outline"
  | "trash-outline"
  | "add"
  | "log-out-outline"
  | "checkbox-outline"
  | "chatbubble-outline"
  | "send-outline"
  | "time-outline"
  | "calendar-outline"
  | "notifications-outline"
  | "repeat-outline"
  | "link-outline"
  | "stats-chart-outline"
  | "download-outline"
  | "alert-circle-outline";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: object;
}

const GLYPHS: Record<IconName, string> = {
  "search-outline": "🔍",
  "close-circle": "✕",
  "close-outline": "✕",
  "list-outline": "☰",
  "grid-outline": "⊞",
  "chevron-down-outline": "▾",
  "swap-vertical-outline": "⇅",
  "checkmark-outline": "✓",
  "people-outline": "👥",
  "person-add-outline": "👤+",
  "attach-outline": "📎",
  "document-text-outline": "📄",
  "cloud-upload-outline": "☁",
  "folder-open-outline": "📁",
  "create-outline": "✎",
  "trash-outline": "🗑",
  "add": "+",
  "log-out-outline": "↪",
  "checkbox-outline": "✓",
  "chatbubble-outline": "💬",
  "send-outline": "➤",
  "time-outline": "⏱",
  "calendar-outline": "📅",
  "notifications-outline": "🔔",
  "repeat-outline": "↻",
  "link-outline": "🔗",
  "stats-chart-outline": "📊",
  "download-outline": "⬇",
  "alert-circle-outline": "⚠",
};

export default function Icon({
  name,
  size = 18,
  color = "#374151",
  style,
}: IconProps) {
  const glyph = GLYPHS[name] || "•";

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: size * 0.8,
          color,
          lineHeight: size,
          textAlign: "center",
          fontWeight: "600",
        }}
      >
        {glyph}
      </Text>
    </View>
  );
}
