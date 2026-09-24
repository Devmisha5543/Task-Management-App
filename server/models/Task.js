const mongoose = require("mongoose");

const taskMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    role: {
      type: String,
      enum: ["owner", "editor", "viewer"],
      default: "viewer"
    }
  },
  {
    _id: false
  }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 200
    },

    description: {
      type: String,
      maxlength: 2000
    },

    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo"
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },

    dueDate: {
      type: Date
    },

    labels: {
      type: [String]
    },

    // The user who originally created the task
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Users who can access the task
    members: {
      type: [taskMemberSchema],
      default: []
    },

    commentsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

taskSchema.index({ "members.user": 1, status: 1 });

module.exports = mongoose.model("Task", taskSchema);