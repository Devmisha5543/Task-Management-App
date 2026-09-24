const express = require("express");
const {
  register,
  login,
  getMe,
  updateProfile,
  uploadProfilePhoto,
  deleteProfilePhoto
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

module.exports = router;