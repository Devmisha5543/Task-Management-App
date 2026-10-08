const { Expo } = require("expo-server-sdk");
const User = require("../models/User");

const expo = new Expo();

/**
 * Send an Expo Push Notification to a list of tokens
 */
const sendPushNotification = async (pushTokens, { title, body, data = {}, badge = 1 }) => {
  if (!pushTokens || pushTokens.length === 0) {
    return { success: true, message: "No push tokens provided" };
  }

  const validTokens = pushTokens.filter((token) => Expo.isExpoPushToken(token));
  if (validTokens.length === 0) {
    return { success: false, message: "No valid Expo push tokens found" };
  }

  const messages = validTokens.map((token) => ({
    to: token,
    sound: "default",
    title,
    body,
    data,
    badge,
    priority: "high",
    channelId: "default",
  }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error("Error sending push notification chunk:", error);
    }
  }

  return { success: true, tickets };
};

/**
 * Send push notification to a user by userId or User document
 */
const sendPushToUser = async (userIdOrUser, { title, body, data = {} }) => {
  try {
    let user = userIdOrUser;
    if (typeof userIdOrUser === "string" || userIdOrUser instanceof String) {
      user = await User.findById(userIdOrUser).select("pushTokens pushPreferences username");
    }

    if (!user || !user.pushTokens || user.pushTokens.length === 0) {
      return { success: true, message: "User has no registered push tokens" };
    }

    return await sendPushNotification(user.pushTokens, {
      title,
      body,
      data,
    });
  } catch (err) {
    console.error("Failed to send push notification to user:", err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendPushNotification,
  sendPushToUser,
};
