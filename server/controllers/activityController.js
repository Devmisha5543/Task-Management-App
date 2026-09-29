const Activity = require("../models/Activity");
const Task = require("../models/Task");

/**
 * Get activity history for a specific task.
 * GET /api/tasks/:id/activity
 */
const getTaskActivities = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if requesting user is creator or member
    const currentUserId = String(req.userId);
    const isCreator = String(task.createdBy) === currentUserId;
    const isMember = task.members.some(
      (m) => String(m.user) === currentUserId
    );

    if (!isCreator && !isMember) {
      return res.status(403).json({ message: "Not authorized to view activity for this task" });
    }

    const activities = await Activity.find({ task: id })
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json(activities);
  } catch (error) {
    console.error("Error fetching task activities:", error);
    return res.status(500).json({ message: "Server error fetching activity history" });
  }
};

module.exports = {
  getTaskActivities,
};
