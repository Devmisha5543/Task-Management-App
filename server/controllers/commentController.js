const Task = require("../models/Task");
const Comment = require("../models/Comment");

// Add a comment to a task
const addComment = async (req, res) => {
  try {
    const { id: taskId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    // Verify task exists and user is a member
    const task = await Task.findOne({
      _id: taskId,
      "members.user": req.userId
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found or access denied" });
    }

    const comment = await Comment.create({
      text: text.trim(),
      user: req.userId,
      task: taskId
    });

    // Increment commentsCount in Task
    await Task.findByIdAndUpdate(taskId, { $inc: { commentsCount: 1 } });

    // Populate user details for response
    await comment.populate("user", "username email profileImage");

    res.status(201).json({
      message: "Comment added successfully",
      comment
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Server error while adding comment" });
  }
};

// Get all comments for a task
const getTaskComments = async (req, res) => {
  try {
    const { id: taskId } = req.params;

    // Verify task exists and user is a member
    const task = await Task.findOne({
      _id: taskId,
      "members.user": req.userId
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found or access denied" });
    }

    const comments = await Comment.find({ task: taskId })
      .populate("user", "username email profileImage")
      .sort({ createdAt: 1 });

    res.status(200).json({ comments });
  } catch (error) {
    console.error("Get task comments error:", error);
    res.status(500).json({ message: "Server error while fetching comments" });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { id: taskId, commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is comment author OR task owner
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isCommentAuthor = comment.user.toString() === req.userId.toString();
    const isTaskOwner = task.createdBy.toString() === req.userId.toString();

    if (!isCommentAuthor && !isTaskOwner) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await Comment.findByIdAndDelete(commentId);

    // Decrement commentsCount in Task
    await Task.findByIdAndUpdate(taskId, { $inc: { commentsCount: -1 } });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Server error while deleting comment" });
  }
};

module.exports = {
  addComment,
  getTaskComments,
  deleteComment
};
