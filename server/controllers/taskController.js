const Task = require("../models/Task");
const User = require("../models/User");

const { createTaskSchema } = require("../validations/taskValidation");
const { addTaskMemberSchema } = require("../validations/taskMemberValidation");
const createTask = async (req, res) => {
  try {
    const validatedData = createTaskSchema.parse(req.body);

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
}).sort({ createdAt: -1 });

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
    const validatedData = createTaskSchema.parse(req.body);

    const task = await Task.findOneAndUpdate(
  {
    _id: req.params.id,
    members: {
      $elemMatch: {
        user: req.userId,
        role: { $in: ["owner", "editor"] }
      }
    }
  },
      validatedData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
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

    task.members.splice(memberIndex, 1);

    await task.save();

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

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  addTaskMember,
  getTaskMembers,
  removeTaskMember
};
