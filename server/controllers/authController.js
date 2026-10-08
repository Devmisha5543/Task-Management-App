const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {
  registerSchema,
  loginSchema
} = require("../validations/authValidation");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");

const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { username, email, password } = validatedData;

    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username or email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        showPhoneNumber: user.showPhoneNumber || false,
        profilePhoto: user.profilePhoto,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Invalid registration data",
        errors: error.issues
      });
    }

    res.status(500).json({
      message: "Server error during registration"
    });
  }
};

const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        showPhoneNumber: user.showPhoneNumber || false,
        profilePhoto: user.profilePhoto,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Login error:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Invalid login data",
        errors: error.issues
      });
    }

    res.status(500).json({
      message: "Server error during login"
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        showPhoneNumber: user.showPhoneNumber || false,
        profilePhoto: user.profilePhoto,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Get current user error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, email, phoneNumber } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check username uniqueness if changed
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(409).json({ message: "Username is already taken" });
      }
      user.username = username;
    }

    // Check email uniqueness if changed
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({ message: "Email is already in use" });
      }
      user.email = email;
    }

    if (phoneNumber !== undefined) {
      user.phoneNumber = phoneNumber;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        showPhoneNumber: user.showPhoneNumber || false,
        profilePhoto: user.profilePhoto,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};

const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded"
      });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "task-management/profile-photos",
          resource_type: "image"
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const oldProfilePhotoPublicId = user.profilePhotoPublicId;

    user.profilePhoto = result.secure_url;
    user.profilePhotoPublicId = result.public_id;

    await user.save();

    if (oldProfilePhotoPublicId) {
      await cloudinary.uploader.destroy(oldProfilePhotoPublicId, {
        resource_type: "image"
      });
    }

    res.status(200).json({
      message: "Profile photo uploaded successfully",
      profilePhoto: user.profilePhoto
    });
  } catch (error) {
    console.error("Upload profile photo error:", error);

    res.status(500).json({
      message: "Server error while uploading profile photo"
    });
  }
};

const deleteProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.profilePhotoPublicId) {
      await cloudinary.uploader.destroy(user.profilePhotoPublicId, {
        resource_type: "image"
      });
    }

    user.profilePhoto = null;
    user.profilePhotoPublicId = null;
    await user.save();

    res.status(200).json({
      message: "Profile photo removed successfully",
      profilePhoto: null
    });
  } catch (error) {
    console.error("Delete profile photo error:", error);
    res.status(500).json({ message: "Server error while deleting profile photo" });
  }
};

const { sendTestNotificationEmail } = require("../utils/emailService");
const { sendPushToUser } = require("../utils/pushService");

const savePushToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Push token is required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.pushTokens) user.pushTokens = [];

    if (!user.pushTokens.includes(token)) {
      user.pushTokens.push(token);
      await user.save();
    }

    res.status(200).json({ message: "Push token registered successfully" });
  } catch (error) {
    console.error("Save push token error:", error);
    res.status(500).json({ message: "Server error while saving push token" });
  }
};

const removePushToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Push token is required" });
    }

    await User.findByIdAndUpdate(req.userId, {
      $pull: { pushTokens: token }
    });

    res.status(200).json({ message: "Push token removed successfully" });
  } catch (error) {
    console.error("Remove push token error:", error);
    res.status(500).json({ message: "Server error while removing push token" });
  }
};

const getNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "emailPreferences pushPreferences pushTokens email username"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      emailPreferences: user.emailPreferences || {
        deadlineAlerts: true,
        taskAssignments: true,
        comments: true,
        weeklyDigest: true,
      },
      pushPreferences: user.pushPreferences || {
        deadlineAlerts: true,
        taskAssignments: true,
        comments: true,
      },
      registeredDevicesCount: user.pushTokens?.length || 0,
      email: user.email,
    });
  } catch (error) {
    console.error("Get notification preferences error:", error);
    res.status(500).json({ message: "Server error fetching notification preferences" });
  }
};

const updateNotificationPreferences = async (req, res) => {
  try {
    const { emailPreferences, pushPreferences } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (emailPreferences) {
      user.emailPreferences = {
        ...(user.emailPreferences || {}),
        ...emailPreferences,
      };
    }

    if (pushPreferences) {
      user.pushPreferences = {
        ...(user.pushPreferences || {}),
        ...pushPreferences,
      };
    }

    await user.save();

    res.status(200).json({
      message: "Notification preferences updated successfully",
      emailPreferences: user.emailPreferences,
      pushPreferences: user.pushPreferences,
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);
    res.status(500).json({ message: "Server error updating notification preferences" });
  }
};

const sendTestEmail = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await sendTestNotificationEmail({
      to: user.email,
      username: user.username,
    });

    if (!result.success) {
      return res.status(500).json({
        message: `Failed to send test email: ${result.error}`,
      });
    }

    res.status(200).json({
      message: `Test email successfully sent to ${user.email}!`,
      previewUrl: result.previewUrl,
    });
  } catch (error) {
    console.error("Send test email error:", error);
    res.status(500).json({ message: "Server error while sending test email" });
  }
};

const sendTestPush = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.pushTokens || user.pushTokens.length === 0) {
      return res.status(400).json({
        message:
          "No registered mobile devices found. Open the mobile app and log in to register your device for push alerts.",
      });
    }

    const result = await sendPushToUser(user, {
      title: "🧪 TaskFlow Mobile Push Test",
      body: "Mobile push notification channel is active and functioning properly!",
      data: { type: "test", timestamp: new Date().toISOString() },
    });

    res.status(200).json({
      message: `Test push sent to ${user.pushTokens.length} active device(s)!`,
      result,
    });
  } catch (error) {
    console.error("Send test push error:", error);
    res.status(500).json({ message: "Server error while sending test push notification" });
  }
};

module.exports = {
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
};