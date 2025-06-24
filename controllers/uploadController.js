import multer from "multer";
import mammoth from "mammoth";
import {
  createAttachment,
  getAttachmentById,
  deleteAttachment,
  getAttachmentByLessonId,
} from "../models/attachment.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import LessonModel from "../models/lessonModel.js";

  export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { lesson_id } = req.body;
    const isWordDoc = req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    let uploadResult;
    let attachmentFormat = req.file.originalname.split('.').pop();

    if (isWordDoc) {
      const markdown = await mammoth.convertToMarkdown({ buffer: req.file.buffer });
      const mdBuffer = Buffer.from(markdown.value, "utf-8");

      uploadResult = await uploadToCloudinary(mdBuffer, {
        resource_type: "raw",
        format: "md",
        public_id: `lessons/${Date.now()}-converted`
      });

      attachmentFormat = "md";
    } else {
      uploadResult = await uploadToCloudinary(req.file.buffer, {
        resource_type: "auto"
      });
    }

    const attachmentDTO = {
      original_name: req.file.originalname,
      mime_type: req.file.mimetype,
      size: req.file.size,
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
      format: attachmentFormat,
      lesson_id: lesson_id ? parseInt(lesson_id) : null
    };

    const attachment = await createAttachment(attachmentDTO);

    // ✅ Update the lesson's content_url if it's a video
    if (lesson_id && req.file.mimetype.startsWith("video")) {
      await LessonModel.update(parseInt(lesson_id), {
        content_url: uploadResult.secure_url
      });
    }

    return res.status(201).json({ attachment });

  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Error uploading file" });
  }
};

export const getFileById = async (req, res) => {
  try {
    const id = req.params.id;
    const attachment = await getAttachmentById(id);

    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" }); 
    }

    return res.json(attachment); 
  } catch (error) {
    console.error("Get file error:", error);
    return res.status(500).json({ message: "Internal Error" });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const id = req.params.id;
    const attachment = await deleteAttachment(id);

    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" }); 
    }

    return res.json({ message: "Attachment deleted", attachment }); 
  } catch (error) {
    console.error("Delete file error:", error);
    return res.status(500).json({ message: "Internal Error" });
  }
};


export const getFileByLessonId = async (req, res) => {
  try {
    const attachment = await getAttachmentByLessonId(req.params.lessonId);
    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found for this lesson" });
    }
    return res.json({ url: attachment.secure_url });
  } catch (error) {
    console.error("Error fetching lesson attachment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
