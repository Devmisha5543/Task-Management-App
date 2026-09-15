const express = require("express");
const {
  register,
  login,
  getMe,
  uploadProfilePhoto
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const {
  imageUpload
} = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put(
  "/profile-photo",
  protect,
  imageUpload.single("file"),
  uploadProfilePhoto
);

module.exports = router;