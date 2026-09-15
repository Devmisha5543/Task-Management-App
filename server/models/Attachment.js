const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true
    },

    url: {
      type: String,
      required: true
    },

    publicId: {
      type: String,
      required: true
    },

    resourceType: {
  type: String,
  required: true
    },

    mimetype: {
      type: String,
      required: true
    },

    size: {
      type: Number,
      required: true
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task"
    }
  },
  {
    timestamps: true
  }
);

attachmentSchema.index({ task: 1 });
attachmentSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model("Attachment", attachmentSchema);