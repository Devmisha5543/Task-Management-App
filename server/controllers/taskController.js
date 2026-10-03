const Task = require("../models/Task");
const User = require("../models/User");
const Notification = require("../models/Notification");
const logActivity = require("../utils/activityLogger");

const {
  createTaskSchema,
  updateTaskSchema,
  subtaskInputSchema,
  updateSubtaskSchema
} = require("../validations/taskValidation");
const { addTaskMemberSchema } = require("../validations/taskMemberValidation");
const createTask = async (req, res) => {
  try {
    const validatedData = createTaskSchema.parse(req.body);
    if (validatedData.dueDate === "") {
      validatedData.dueDate = null;
    }

    const task = await Task.create({
      ...validatedData,
      createdBy: req.userId,
      members: [
        {
          user: req.userId,
          role: "owner"
        }
      ]
    });

    await logActivity({
      taskId: task._id,
      userId: req.userId,
      action: "created",
      details: { title: task.title, status: task.status }
    });

    res.status(201).json({
      message: "Task created successfully",
      task
    });
  } catch (error) {
    console.error("Create task error:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Invalid task data",
        errors: error.issues
      });
    }

    res.status(500).json({
      message: "Server error while creating task"
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      "members.user": req.userId
    })
      .populate("dependencies", "title status priority")
      .sort({ createdAt: -1 });

    res.status(200).json({
      tasks
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    res.status(500).json({
      message: "Server error while fetching tasks"
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const validatedData = updateTaskSchema.parse(req.body);
    if (validatedData.dueDate === "") {
      validatedData.dueDate = null;
    }

    const existingTask = await Task.findOne({
      _id: req.params.id,
      members: {
        $elemMatch: {
          user: req.userId,
          role: { $in: ["owner", "editor"] }
        }
      }
    });

    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Validate dependencies if trying to mark task as done
    if (validatedData.status === "done" && existingTask.dependencies && existingTask.dependencies.length > 0) {
      const dependentTasks = await Task.find({
        _id: { $in: existingTask.dependencies }
      });
      const uncompletedDeps = dependentTasks.filter((d) => d.status !== "done");
      if (uncompletedDeps.length > 0) {
        return res.status(400).json({
          message: `Cannot mark task as done: blocked by prerequisite task(s): ${uncompletedDeps.map((d) => d.title).join(", ")}`,
          blockedBy: uncompletedDeps.map((d) => ({
            _id: d._id,
            title: d.title,
            status: d.status
          }))
        });
      }
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      validatedData,
      {
        new: true,
        runValidators: true
      }
    ).populate("dependencies", "title status priority");

    if (validatedData.status && validatedData.status !== oldStatus) {
      await logActivity({
        taskId: task._id,
        userId: req.userId,
        action: "updated_status",
        details: { oldStatus, newStatus: validatedData.status }
      });
    } else {
      await logActivity({
        taskId: task._id,
        userId: req.userId,
        action: "updated_details",
        details: { updatedFields: Object.keys(validatedData) }
      });
    }

    // If a recurring task is completed, automatically schedule the next occurrence
    if (
      validatedData.status === "done" &&
      oldStatus !== "done" &&
      task.isRecurring &&
      task.recurrence &&
      task.recurrence !== "none"
    ) {
      try {
        const baseDate = existingTask.dueDate ? new Date(existingTask.dueDate) : new Date();
        let nextDueDate = new Date(baseDate);

        if (task.recurrence === "daily") {
          nextDueDate.setDate(nextDueDate.getDate() + 1);
        } else if (task.recurrence === "weekly") {
          nextDueDate.setDate(nextDueDate.getDate() + 7);
        } else if (task.recurrence === "monthly") {
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        }

        const nextTask = await Task.create({
          title: task.title,
          description: task.description,
          status: "todo",
          priority: task.priority,
          dueDate: nextDueDate,
          labels: task.labels || [],
          createdBy: task.createdBy,
          members: task.members || [{ user: req.userId, role: "owner" }],
          isRecurring: true,
          recurrence: task.recurrence,
          nextRecurrenceDate: nextDueDate,
          subtasks: (task.subtasks || []).map((s) => ({ title: s.title, completed: false }))
        });

        await logActivity({
          taskId: nextTask._id,
          userId: req.userId,
          action: "recurrence_spawned",
          details: { previousTaskId: task._id, recurrence: task.recurrence, nextDueDate }
        });

        await Notification.create({
          recipient: req.userId,
          task: nextTask._id,
          type: "recurrence_spawned",
          title: `Recurring Task Scheduled: ${nextTask.title}`,
          message: `A new cycle for "${nextTask.title}" has been created for ${nextDueDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}.`
        });
      } catch (recErr) {
        console.error("Failed to spawn recurring task cycle:", recErr);
      }
    }

    res.status(200).json({
      message: "Task updated successfully",
      task
    });
  } catch (error) {
    console.error("Update task error:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Invalid task data",
        errors: error.issues
      });
    }

    res.status(500).json({
      message: "Server error while updating task"
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.status(200).json({
      message: "Task deleted successfully"
    });
  } catch (error) {
    console.error("Delete task error:", error);

    res.status(500).json({
      message: "Server error while deleting task"
    });
  }
};

const addTaskMember = async (req, res) => {
  try {
    const validatedData = addTaskMemberSchema.parse(req.body);

    const { email, role } = validatedData;

    // Only the task owner can share it
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.userId
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found or you are not the owner"
      });
    }

    // Find the user being added
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User with this email does not exist"
      });
    }

    // Don't allow the owner to be added again
    if (user._id.toString() === req.userId.toString()) {
      return res.status(400).json({
        message: "You are already the owner of this task"
      });
    }

    // Check whether user is already a member
    const alreadyMember = task.members.some(
      (member) => member.user.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(409).json({
        message: "User is already a member of this task"
      });
    }

    task.members.push({
      user: user._id,
      role
    });

    await task.save();

    await logActivity({
      taskId: task._id,
      userId: req.userId,
      action: "added_member",
      details: { addedUserEmail: email, role }
    });

    // Notify the added user
    try {
      await Notification.create({
        recipient: user._id,
        sender: req.userId,
        task: task._id,
        type: "task_shared",
        title: `Task Shared with You: ${task.title}`,
        message: `You were added as a ${role} to "${task.title}".`
      });
    } catch (notifErr) {
      console.error("Failed to send task share notification:", notifErr);
    }

    res.status(200).json({
      message: "User added to task successfully",
      task
    });
  } catch (error) {
    console.error("Add task member error:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Invalid member data",
        errors: error.issues
      });
    }

    res.status(500).json({
      message: "Server error while adding task member"
    });
  }
};

const getTaskMembers = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.userId
    }).populate("members.user", "username email");

    if (!task) {
      return res.status(404).json({
        message: "Task not found or you are not the owner"
      });
    }

    res.status(200).json({
      members: task.members
    });
  } catch (error) {
    console.error("Get task members error:", error);

    res.status(500).json({
      message: "Server error while fetching task members"
    });
  }
};

const removeTaskMember = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.userId
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found or you are not the owner"
      });
    }

    const memberIndex = task.members.findIndex(
      (member) => member.user.toString() === req.params.userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        message: "User is not a member of this task"
      });
    }

    // Prevent removing the owner
    if (task.members[memberIndex].role === "owner") {
      return res.status(400).json({
        message: "The task owner cannot be removed"
      });
    }

    const removedUserId = task.members[memberIndex].user;
    task.members.splice(memberIndex, 1);

    await task.save();

    await logActivity({
      taskId: task._id,
      userId: req.userId,
      action: "removed_member",
      details: { removedUserId }
    });

    res.status(200).json({
      message: "User removed from task successfully"
    });
  } catch (error) {
    console.error("Remove task member error:", error);

    res.status(500).json({
      message: "Server error while removing task member"
    });
  }
};

const addSubtask = async (req, res) => {
  try {
    const { title } = subtaskInputSchema.parse(req.body);

    const task = await Task.findOne({
      _id: req.params.id,
      members: {
        $elemMatch: {
          user: req.userId,
          role: { $in: ["owner", "editor"] }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found or insufficient permissions"
      });
    }

    const newSubtask = {
      title: title.trim(),
      completed: false
    };

    task.subtasks.push(newSubtask);
    await task.save();

    const createdSubtask = task.subtasks[task.subtasks.length - 1];

    await logActivity({
      taskId: task._id,
      userId: req.userId,
      action: "added_subtask",
      details: { title: createdSubtask.title }
    });

    res.status(201).json({
      message: "Subtask added successfully",
      task,
      subtask: createdSubtask
    });
  } catch (error) {
    console.error("Add subtask error:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Invalid subtask data",
        errors: error.issues
      });
    }
    res.status(500).json({
      message: "Server error while adding subtask"
    });
  }
};

const updateSubtask = async (req, res) => {
  try {
    const validatedData = updateSubtaskSchema.parse(req.body);

    const task = await Task.findOne({
      _id: req.params.id,
      members: {
        $elemMatch: {
          user: req.userId,
          role: { $in: ["owner", "editor"] }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found or insufficient permissions"
      });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({
        message: "Subtask not found"
      });
    }

    let actionToLog = null;
    if (typeof validatedData.completed === "boolean" && validatedData.completed !== subtask.completed) {
      subtask.completed = validatedData.completed;
      subtask.completedAt = validatedData.completed ? new Date() : null;
      actionToLog = validatedData.completed ? "completed_subtask" : "uncompleted_subtask";
    }

    if (validatedData.title) {
      subtask.title = validatedData.title.trim();
    }

    await task.save();

    if (actionToLog) {
      await logActivity({
        taskId: task._id,
        userId: req.userId,
        action: actionToLog,
        details: { title: subtask.title }
      });
    }

    res.status(200).json({
      message: "Subtask updated successfully",
      task,
      subtask
    });
  } catch (error) {
    console.error("Update subtask error:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Invalid subtask data",
        errors: error.issues
      });
    }
    res.status(500).json({
      message: "Server error while updating subtask"
    });
  }
};

const deleteSubtask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      members: {
        $elemMatch: {
          user: req.userId,
          role: { $in: ["owner", "editor"] }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found or insufficient permissions"
      });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({
        message: "Subtask not found"
      });
    }

    const subtaskTitle = subtask.title;
    task.subtasks.pull(req.params.subtaskId);
    await task.save();

    await logActivity({
      taskId: task._id,
      userId: req.userId,
      action: "deleted_subtask",
      details: { title: subtaskTitle }
    });

    res.status(200).json({
      message: "Subtask deleted successfully",
      task
    });
  } catch (error) {
    console.error("Delete subtask error:", error);
    res.status(500).json({
      message: "Server error while deleting subtask"
    });
  }
};

const getTaskAnalytics = async (req, res) => {
  try {
    const tasks = await Task.find({ "members.user": req.userId });

    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const done = tasks.filter((t) => t.status === "done").length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    const now = new Date();
    const overdue = tasks.filter(
      (t) => t.status !== "done" && t.dueDate && new Date(t.dueDate) < now
    ).length;

    const highPriority = tasks.filter((t) => t.priority === "high").length;
    const mediumPriority = tasks.filter((t) => t.priority === "medium").length;
    const lowPriority = tasks.filter((t) => t.priority === "low").length;

    // 7-day velocity
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const completedThisWeek = tasks.filter(
      (t) => t.status === "done" && new Date(t.updatedAt) >= sevenDaysAgo
    ).length;
    const completedLastWeek = tasks.filter(
      (t) =>
        t.status === "done" &&
        new Date(t.updatedAt) >= fourteenDaysAgo &&
        new Date(t.updatedAt) < sevenDaysAgo
    ).length;

    // Subtask stats
    let totalSubtasks = 0;
    let completedSubtasks = 0;
    for (const t of tasks) {
      if (t.subtasks && t.subtasks.length > 0) {
        totalSubtasks += t.subtasks.length;
        completedSubtasks += t.subtasks.filter((s) => s.completed).length;
      }
    }
    const subtaskCompletionRate =
      totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    res.status(200).json({
      analytics: {
        total,
        todo,
        inProgress,
        done,
        completionRate,
        overdue,
        priorityBreakdown: {
          high: highPriority,
          medium: mediumPriority,
          low: lowPriority
        },
        velocity: {
          completedThisWeek,
          completedLastWeek
        },
        subtasks: {
          total: totalSubtasks,
          completed: completedSubtasks,
          rate: subtaskCompletionRate
        }
      }
    });
  } catch (error) {
    console.error("Get task analytics error:", error);
    res.status(500).json({ message: "Server error while calculating analytics" });
  }
};

module.exports = {
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
};
