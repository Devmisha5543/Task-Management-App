const Attachment = require("../models/Attachment");
const Task = require("../models/Task");
const cloudinary = require("../config/cloudinary");

const uploadTaskAttachment = async (req, res) => {
  try {
    // 1. Make sure a file was actually uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    // 2. Check that the user has access to this task
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
      return res.status(403).json({
        message: "You do not have permission to upload files to this task"
      });
    }

    // 3. Upload the file to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "task-management/attachments",
          resource_type: "auto"
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // 4. Save file metadata in MongoDB
    const attachment = await Attachment.create({
      filename: req.file.originalname,
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.userId,
      task: task._id
    });

    // 5. Return the attachment
    res.status(201).json({
      message: "File uploaded successfully",
      attachment
    });
  } catch (error) {
    console.error("Upload attachment error:", error);

    res.status(500).json({
      message: "Server error while uploading file"
    });
  }
};

const getTaskAttachments = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      "members.user": req.userId
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found or you do not have access"
      });
    }

    const attachments = await Attachment.find({
      task: req.params.id
    })
      .populate("uploadedBy", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      attachments
    });
  } catch (error) {
    console.error("Get task attachments error:", error);

    res.status(500).json({
      message: "Server error while fetching attachments"
    });
  }
};

const deleteTaskAttachment = async (req, res) => {
  try {
    // 1. Find the attachment
    const attachment = await Attachment.findById(req.params.attachmentId);

    if (!attachment) {
      return res.status(404).json({
        message: "Attachment not found"
      });
    }

    // 2. Check that the user has permission to delete it
    const task = await Task.findOne({
      _id: attachment.task,
      members: {
        $elemMatch: {
          user: req.userId,
          role: { $in: ["owner", "editor"] }
        }
      }
    });

    if (!task) {
      return res.status(403).json({
        message: "You do not have permission to delete this attachment"
      });
    }

    // 3. Delete the actual file from Cloudinary
    await cloudinary.uploader.destroy(
  attachment.publicId,
  {
    resource_type: attachment.resourceType
  });

    // 4. Delete the metadata from MongoDB
    await Attachment.findByIdAndDelete(req.params.attachmentId);

    res.status(200).json({
      message: "Attachment deleted successfully"
    });
  } catch (error) {
    console.error("Delete attachment error:", error);

    res.status(500).json({
      message: "Server error while deleting attachment"
    });
  }
};

module.exports = {
  uploadTaskAttachment,
  getTaskAttachments,
  deleteTaskAttachment
};