const Activity = require("../models/Activity");

/**
 * Utility function to log an activity for a task.
 * @param {Object} params
 * @param {string} params.taskId - Task ID
 * @param {string} params.userId - User ID who triggered the action
 * @param {string} params.action - Action identifier
 * @param {Object} [params.details] - Additional detail metadata
 */
const logActivity = async ({ taskId, userId, action, details = {} }) => {
  try {
    await Activity.create({
      task: taskId,
      user: userId,
      action,
      details,
    });
  } catch (err) {
    console.error("Failed to log task activity:", err);
  }
};

module.exports = logActivity;
