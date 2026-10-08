const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 30
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },

    phoneNumber: {
      type: String,
      default: ""
    },

    showPhoneNumber: {
      type: Boolean,
      default: false
    },

    profilePhoto: {
      type: String,
      default: null
    },
    profilePhotoPublicId: {
      type: String,
      default: null
    },

    // Mobile Device Push Notification Tokens (Expo)
    pushTokens: {
      type: [String],
      default: []
    },

    // Automated Email Preferences
    emailPreferences: {
      deadlineAlerts: { type: Boolean, default: true },
      taskAssignments: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: true }
    },

    // Mobile Push Preferences
    pushPreferences: {
      deadlineAlerts: { type: Boolean, default: true },
      taskAssignments: { type: Boolean, default: true },
      comments: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);