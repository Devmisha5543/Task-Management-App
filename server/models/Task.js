const mongoose = require("mongoose");

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

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);
taskSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("Task", taskSchema);