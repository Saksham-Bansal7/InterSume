import Resume from "../models/resumeModel.js";
import fs from "fs";
import path from "path";

export const createResume = async (req, res) => {
  try {
    const title = req.body;

    //DEFAULT RESUME TEMPLATE
    const defaultResumeData = {
      template: "01",
      colorPalette: [],
      profileInfo: {
        profileImg: null,
        previewUrl: "",
        fullName: "",
        designation: "",
        summary: "",
      },
      contactInfo: {
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        website: "",
      },
      workExperience: [
        {
          company: "",
          role: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
      education: [
        {
          degree: "",
          institution: "",
          startDate: "",
          endDate: "",
        },
      ],
      skills: [
        {
          name: "",
          progress: 0,
        },
      ],
      projects: [
        {
          title: "",
          description: "",
          github: "",
          liveDemo: "",
        },
      ],
      certifications: [
        {
          title: "",
          issuer: "",
          year: "",
        },
      ],
      languages: [
        {
          name: "",
          progress: "",
        },
      ],
      interests: [""],
    };
    const newResume = await Resume.create({
      userId: req.user._id,
      title,
      ...defaultResumeData,
      ...req.body, // Merge with any additional data from the request body
    });
    res.status(201).json({
      message: "Resume created successfully",
      resume: newResume,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create resume", error: error.message });
  }
};

//GET FUNCTION
export const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({
      updatedAt: -1,
    });
    res.json(resumes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch resumes", error: error.message });
  }
};

//GET RESUME BY ID
export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.json(resume);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch resume", error: error.message });
  }
};

//UPDATE RESUME
export const updateResume = async (req, res) => {
  try {
    console.log("Updating resume with ID:", req.params.id);
    console.log("User ID:", req.user._id);
    console.log("Update data:", req.body);

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!resume) {
      console.log("Resume not found for user");
      return res
        .status(404)
        .json({ message: "Resume not found or not accessible" });
    }

    console.log("Current resume data:", resume);
    Object.assign(resume, req.body);
    console.log("Resume after update:", resume);

    const savedResume = await resume.save();
    console.log("Resume saved successfully");
    res.json(savedResume);
  } catch (error) {
    console.error("Error updating resume:", error);
    res
      .status(500)
      .json({ message: "Failed to update resume", error: error.message });
  }
};

//DELETE RESUME

export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!resume) {
      return res
        .status(404)
        .json({ message: "Resume not found or not accessible" });
    }

    //CREATE UPLOADS FOLDER AND STORE the RESUME TEHRE
    const uploadsFolder = path.join(process.cwd(), "uploads");
    if (resume.thumbnailLink) {
      const oldThumbnail = path.join(uploadsFolder, resume.thumbnailLink);
      if (fs.existsSync(oldThumbnail)) {
        fs.unlinkSync(oldThumbnail); // Delete the thumbnail file
      }
    }
    if (resume.profileInfo.profilePreviewUrl) {
      const oldProfile = path.join(
        uploadsFolder,
        path.basename(resume.profileInfo.profilePreviewUrl)
      );
      if (fs.existsSync(oldProfile)) {
        fs.unlinkSync(oldProfile); // Delete the profile preview file
      }
    }
    //DELETE THE RESUME
    const deleted = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Resume not found or not accessible" });
    }
    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete resume", error: error.message });
  }
};
