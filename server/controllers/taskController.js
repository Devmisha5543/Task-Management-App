const Task = require("../models/Task");
const { createTaskSchema } = require("../validations/taskValidation");

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

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask
};
