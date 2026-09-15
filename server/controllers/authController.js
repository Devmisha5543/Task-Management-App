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
    // Validate incoming data
    const validatedData = registerSchema.parse(req.body);

    const { username, email, password } = validatedData;

    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username or email already exists"
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user
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
        email: user.email
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

    // Find the user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Compare the entered password with the stored hash
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
        email: user.email
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

const uploadProfilePhoto = async (req, res) => {
  try {
    // Make sure an image was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded"
      });
    }

    // Upload image to Cloudinary
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

    // Find current user
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Save Cloudinary URL
    const oldProfilePhotoPublicId = user.profilePhotoPublicId;

    user.profilePhoto = result.secure_url;
    user.profilePhotoPublicId = result.public_id;

    await user.save();

// Delete the old photo from Cloudinary
    if (oldProfilePhotoPublicId) {
      await cloudinary.uploader.destroy(
        oldProfilePhotoPublicId,
        {
          resource_type: "image"
        }
     );
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


module.exports = {
  register,
  login,
  getMe,
  uploadProfilePhoto
};