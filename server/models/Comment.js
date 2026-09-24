const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true
    }
  },
  {
    timestamps: true
  }
);

commentSchema.index({ task: 1, createdAt: 1 });

module.exports = mongoose.model("Comment", commentSchema);
