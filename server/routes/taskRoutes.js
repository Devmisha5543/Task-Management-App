const express = require("express");

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  addTaskMember,
  getTaskMembers,
  removeTaskMember,
  addSubtask,
  updateSubtask,
  deleteSubtask,
  getTaskAnalytics
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

const { getTaskActivities } = require("../controllers/activityController");

const router = express.Router();

router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.get("/analytics", protect, getTaskAnalytics);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

// Subtask routes
router.post("/:id/subtasks", protect, addSubtask);
router.patch("/:id/subtasks/:subtaskId", protect, updateSubtask);
router.delete("/:id/subtasks/:subtaskId", protect, deleteSubtask);

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

// Activity Log route
router.get("/:id/activity", protect, getTaskActivities);

module.exports = router;