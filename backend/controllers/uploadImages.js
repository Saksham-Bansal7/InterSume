import fs from "fs";
import path from "path";

import Resume from "../models/resumeModel.js";
import upload from "../middleware/uploadMiddleware.js";

export const uploadResumeImages = (req, res) => {
  try {
    //CONFIGURE MULTER TO HANDLE IMAGE UPLOADS
    upload.fields([{ name: "thumbnail" }, { name: "profileImage" }])(
      req,
      res,
      async (err) => {
        if (err) {
          return res
            .status(400)
            .json({ message: "Error uploading images", error: err.message });
        }
        const resumeId = req.params.id; // Get resumeId from URL params
        const resume = await Resume.findOne({
          _id: resumeId,
          userId: req.user._id,
        });
        if (!resume) {
          return res
            .status(404)
            .json({ message: "Resume not found or not accessible" });
        }
        //USE PROCESS CWD TO GET THE CURRENT WORKING DIRECTORY
        const uploadsFolder = path.join(process.cwd(), "uploads");
        const baseUrl = `${req.protocol}://${req.get("host")}`;

        const newThumbnail = req.files.thumbnail?.[0];
        const newProfileImage = req.files.profileImage?.[0];
        if (newThumbnail) {
          //DELETE OLD THUMBNAIL IF EXISTS
          if (resume.thumbnailLink) {
            const oldThumbnailPath = path.join(
              uploadsFolder,
              path.basename(resume.thumbnailLink)
            );
            if (fs.existsSync(oldThumbnailPath)) {
              fs.unlinkSync(oldThumbnailPath); // Delete the old thumbnail file
            }
          }
          resume.thumbnailLink = `${baseUrl}/uploads/${newThumbnail.filename}`;
        }
        if (newProfileImage) {
          if (resume.profileInfo?.profilePreviewUrl) {
            const oldProfile = path.join(
              uploadsFolder,
              path.basename(resume.profileInfo.profilePreviewUrl)
            );
            if (fs.existsSync(oldProfile)) {
              fs.unlinkSync(oldProfile); // Delete the old profile image file
            }
          }
          resume.profileInfo.profilePreviewUrl = `${baseUrl}/uploads/${newProfileImage.filename}`;
        }
        res.status(200).json({
          message: "Images uploaded successfully",
          thumbnailLink: resume.thumbnailLink,
          profilePreviewUrl: resume.profileInfo.profilePreviewUrl,
        });
      }
    );
  } catch (error) {
    console.error("Error uploading images:", error);
    res
      .status(500)
      .json({ message: "Failed to upload images", error: error.message });
  }
};
