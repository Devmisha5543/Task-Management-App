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

module.exports = router;