const Notification = require("../models/Notification");
const Task = require("../models/Task");

// Dynamic deadline checks: generate approaching / overdue alerts if not recently created
const checkTaskDeadlinesForUser = async (userId) => {
  try {
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const activeTasks = await Task.find({
      "members.user": userId,
      status: { $ne: "done" },
      dueDate: { $ne: null },
    });

    for (const task of activeTasks) {
      if (!task.dueDate) continue;
      const due = new Date(task.dueDate);

      if (due < now) {
        // Overdue alert
        const recentNotif = await Notification.findOne({
          recipient: userId,
          task: task._id,
          type: "deadline_overdue",
          createdAt: { $gte: oneDayAgo },
        });

        if (!recentNotif) {
          const formattedDate = due.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          });
          await Notification.create({
            recipient: userId,
            task: task._id,
            type: "deadline_overdue",
            title: `Task Overdue: ${task.title}`,
            message: `"${task.title}" was due on ${formattedDate}. Please review and update its status.`,
          });
        }
      } else if (due <= oneDayFromNow) {
        // Approaching deadline alert
        const recentNotif = await Notification.findOne({
          recipient: userId,
          task: task._id,
          type: "deadline_approaching",
          createdAt: { $gte: oneDayAgo },
        });

        if (!recentNotif) {
          const formattedDate = due.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          });
          await Notification.create({
            recipient: userId,
            task: task._id,
            type: "deadline_approaching",
            title: `Deadline Approaching: ${task.title}`,
            message: `"${task.title}" is due soon (${formattedDate}). Don't forget to wrap it up!`,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error in checkTaskDeadlinesForUser:", error);
  }
};

const getNotifications = async (req, res) => {
  try {
    // Dynamically check and create any pending deadline notifications
    await checkTaskDeadlinesForUser(req.userId);

    const notifications = await Notification.find({ recipient: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "username email profilePhoto")
      .populate("task", "title status priority");

    const unreadCount = await Notification.countDocuments({
      recipient: req.userId,
      read: false,
    });

    res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Server error while fetching notifications" });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Marked as read", notification });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({ message: "Server error while updating notification" });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, read: false },
      { read: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    res.status(500).json({ message: "Server error while updating notifications" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: "Server error while deleting notification" });
  }
};

const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.userId });
    res.status(200).json({ message: "All notifications cleared" });
  } catch (error) {
    console.error("Clear all notifications error:", error);
    res.status(500).json({ message: "Server error while clearing notifications" });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
};
