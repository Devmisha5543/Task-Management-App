const express = require("express");

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  addTaskMember,
  getTaskMembers,
  removeTaskMember
} = require("../controllers/taskController");

const protect = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const {
  uploadTaskAttachment,
  getTaskAttachments,
  deleteTaskAttachment
} = require("../controllers/attachmentController");

const {
  addComment,
  getTaskComments,
  deleteComment
} = require("../controllers/commentController");

const router = express.Router();

router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

router.post("/:id/members", protect, addTaskMember);

router.get("/:id/members", protect, getTaskMembers);

router.delete(
  "/:id/members/:userId",
  protect,
  removeTaskMember
);

router.post(
  "/:id/attachments",
  protect,
  upload.single("file"),
  uploadTaskAttachment
);

router.get(
  "/:id/attachments",
  protect,
  getTaskAttachments
);

router.delete(
  "/:id/attachments/:attachmentId",
  protect,
  deleteTaskAttachment
);

// Comment routes
router.post("/:id/comments", protect, addComment);
router.get("/:id/comments", protect, getTaskComments);
router.delete("/:id/comments/:commentId", protect, deleteComment);

module.exports = router;