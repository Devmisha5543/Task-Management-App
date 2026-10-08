const express = require("express");
const {
  register,
  login,
  getMe,
  updateProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
  savePushToken,
  removePushToken,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendTestEmail,
  sendTestPush,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const {
  imageUpload
} = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put(
  "/profile-photo",
  protect,
  imageUpload.single("file"),
  uploadProfilePhoto
);
router.delete("/profile-photo", protect, deleteProfilePhoto);

// Push Tokens
router.post("/push-token", protect, savePushToken);
router.delete("/push-token", protect, removePushToken);

// Notification Preferences
router.get("/notification-preferences", protect, getNotificationPreferences);
router.put("/notification-preferences", protect, updateNotificationPreferences);

// Test Notification Triggers
router.post("/test-email", protect, sendTestEmail);
router.post("/test-push", protect, sendTestPush);

module.exports = router;