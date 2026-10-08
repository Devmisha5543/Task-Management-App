const cron = require("node-cron");
const Task = require("../models/Task");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { emitToUser } = require("../socket");
const { sendDeadlineReminderEmail } = require("./emailService");
const { sendPushToUser } = require("./pushService");

/**
 * Scan database for upcoming deadlines and overdue tasks, and trigger multichannel alerts
 */
const runDeadlineNotificationScan = async () => {
  try {
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const eighteenHoursAgo = new Date(now.getTime() - 18 * 60 * 60 * 1000);

    // 1. Scan tasks due within 24 hours
    const upcomingTasks = await Task.find({
      status: { $ne: "done" },
      dueDate: { $gte: now, $lte: twentyFourHoursFromNow },
    }).populate("members.user", "username email pushTokens emailPreferences pushPreferences");

    for (const task of upcomingTasks) {
      for (const member of task.members) {
        const user = member.user;
        if (!user || !user._id) continue;

        // Check if an alert was already sent in the last 18 hours
        const recentNotif = await Notification.findOne({
          recipient: user._id,
          task: task._id,
          type: "deadline_approaching",
          createdAt: { $gte: eighteenHoursAgo },
        });

        if (!recentNotif) {
          const formattedDate = new Date(task.dueDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          // In-app Notification
          const createdNotif = await Notification.create({
            recipient: user._id,
            task: task._id,
            type: "deadline_approaching",
            title: `Deadline Approaching: ${task.title}`,
            message: `"${task.title}" is due soon (${formattedDate}). Don't forget to wrap it up!`,
          });

          // Real-time WebSocket emission
          emitToUser(user._id.toString(), "notification:new", createdNotif);

          // Mobile Push Notification
          if (user.pushPreferences?.deadlineAlerts !== false) {
            sendPushToUser(user, {
              title: `⏰ Task Due Soon: ${task.title}`,
              body: `Due on ${formattedDate}. Tap to view task details.`,
              data: { taskId: task._id.toString(), type: "deadline_approaching" },
            });
          }

          // Email Notification
          if (user.emailPreferences?.deadlineAlerts !== false && user.email) {
            sendDeadlineReminderEmail({
              to: user.email,
              username: user.username,
              task,
              isOverdue: false,
            });
          }
        }
      }
    }

    // 2. Scan overdue tasks
    const overdueTasks = await Task.find({
      status: { $ne: "done" },
      dueDate: { $lt: now, $ne: null },
    }).populate("members.user", "username email pushTokens emailPreferences pushPreferences");

    for (const task of overdueTasks) {
      for (const member of task.members) {
        const user = member.user;
        if (!user || !user._id) continue;

        const recentNotif = await Notification.findOne({
          recipient: user._id,
          task: task._id,
          type: "deadline_overdue",
          createdAt: { $gte: eighteenHoursAgo },
        });

        if (!recentNotif) {
          const formattedDate = new Date(task.dueDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          const createdNotif = await Notification.create({
            recipient: user._id,
            task: task._id,
            type: "deadline_overdue",
            title: `Task Overdue: ${task.title}`,
            message: `"${task.title}" was due on ${formattedDate}. Please review and update its status.`,
          });

          emitToUser(user._id.toString(), "notification:new", createdNotif);

          if (user.pushPreferences?.deadlineAlerts !== false) {
            sendPushToUser(user, {
              title: `🚨 Task Overdue: ${task.title}`,
              body: `Was due on ${formattedDate}. Please check in on TaskFlow.`,
              data: { taskId: task._id.toString(), type: "deadline_overdue" },
            });
          }

          if (user.emailPreferences?.deadlineAlerts !== false && user.email) {
            sendDeadlineReminderEmail({
              to: user.email,
              username: user.username,
              task,
              isOverdue: true,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Error running deadline notification scan:", error);
  }
};

const initCronJobs = () => {
  // Run every 30 minutes (* / 30 * * * *)
  cron.schedule("*/30 * * * *", () => {
    console.log("⏰ [Cron] Running automated deadline & overdue task check...");
    runDeadlineNotificationScan();
  });

  console.log(" Cron job scheduler initialized (checking deadlines every 30 mins)");
};

module.exports = {
  initCronJobs,
  runDeadlineNotificationScan,
};
