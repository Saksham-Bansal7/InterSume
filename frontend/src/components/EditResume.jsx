import React, { useCallback, useRef, useState, useEffect } from "react";
import DashboardLayout from "./DashboardLayout";
import {
  buttonStyles,
  containerStyles,
  iconStyles,
} from "../assets/dummystyle";
import { TitleInput } from "./Input";
import { useNavigate, useParams } from "react-router-dom";
import {
  Download,
  DownloadIcon,
  Loader2,
  Palette,
  Save,
  Trash2,
  Check,
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import toast from "react-hot-toast";
import { fixTailwindColors } from "../utils/color";
import html2pdf from "html2pdf.js";
import html2canvas from "html2canvas";
import StepProgress from "./StepProgress";
import { AlertCircle } from "react-feather";
import { ArrowLeft } from "lucide-react";
import {
  ProfileInfoForm,
  ContactInfoForm,
  EducationDetailsForm,
  SkillsInfoForm,
  ProjectDetailForm,
  CertificationInfoForm,
  AdditionalInfoForm,
  WorkExperienceForm,
} from "./Forms";
import { statusStyles } from "../assets/dummystyle";
import RenderResume from "./RenderResume";
import { Modal } from "./Modal";
import ThemeSelector from "./ThemeSelector";

//Resize observer hook
const useResizeObserver = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const ref = useCallback((node) => {
    if (node) {
      const resizeObserver = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        setSize({ width, height });
      });
      resizeObserver.observe(node);
    }
  }, []);

  return { ...size, ref };
};

// Utility function to convert dataURL to File
const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

// Utility function to process resume data for backend
const processResumeDataForBackend = (resumeData, completionPercentage) => {
  try {
    return {
      ...resumeData,
      completion: completionPercentage,
      // Convert date strings to proper Date objects with error handling
      education: resumeData.education.map((edu) => ({
        ...edu,
        startDate:
          edu.startDate && edu.startDate.trim()
            ? new Date(edu.startDate + "-01")
            : null,
        endDate:
          edu.endDate && edu.endDate.trim()
            ? new Date(edu.endDate + "-01")
            : null,
      })),
      workExperience: resumeData.workExperience.map((work) => ({
        ...work,
        startDate:
          work.startDate && work.startDate.trim()
            ? new Date(work.startDate + "-01")
            : null,
        endDate:
          work.endDate && work.endDate.trim()
            ? new Date(work.endDate + "-01")
            : null,
      })),
    };
  } catch (error) {
    console.error("Error processing resume data for backend:", error);
    // Return original data if processing fails
    return {
      ...resumeData,
      completion: completionPercentage,
    };
  }
};

// Utility function to process resume data from backend
const processResumeDataFromBackend = (resumeInfo) => {
  try {
    // Convert Date objects back to YYYY-MM format for the form inputs
    if (resumeInfo.education) {
      resumeInfo.education = resumeInfo.education.map((edu) => ({
        ...edu,
        startDate: edu.startDate
          ? typeof edu.startDate === "string"
            ? edu.startDate.substring(0, 7)
            : new Date(edu.startDate).toISOString().substring(0, 7)
          : "",
        endDate: edu.endDate
          ? typeof edu.endDate === "string"
            ? edu.endDate.substring(0, 7)
            : new Date(edu.endDate).toISOString().substring(0, 7)
          : "",
      }));
    }

    if (resumeInfo.workExperience) {
      resumeInfo.workExperience = resumeInfo.workExperience.map((work) => ({
        ...work,
        startDate: work.startDate
          ? typeof work.startDate === "string"
            ? work.startDate.substring(0, 7)
            : new Date(work.startDate).toISOString().substring(0, 7)
          : "",
        endDate: work.endDate
          ? typeof work.endDate === "string"
            ? work.endDate.substring(0, 7)
            : new Date(work.endDate).toISOString().substring(0, 7)
          : "",
      }));
    }

    return resumeInfo;
  } catch (error) {
    console.error("Error processing resume data from backend:", error);
    // Return original data if processing fails
    return resumeInfo;
  }
};

const EditResume = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const resumeDownloadRef = useRef(null);
  const thumbnailRef = useRef(null);

  const [openThemeSelector, setOpenThemeSelector] = useState(false);
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("profile-info");
  const [progress, setProgress] = useState(12.5); // Initialize with first step (1/8 * 100)
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { width: previewWidth, ref: previewContainerRef } = useResizeObserver();

  const [resumeData, setResumeData] = useState({
    title: "Professional Resume",
    thumbnailLink: "",
    profileInfo: {
      fullName: "",
      designation: "",
      summary: "",
    },
    template: "01", // Changed to string to match backend model
    colorPalette: [],
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
        progress: 0,
      },
    ],
    interests: [""],
  });

  // Calculate completion percentage
  const calculateCompletion = () => {
    let completedFields = 0;
    let totalFields = 0;

    // Profile Info
    totalFields += 3;
    if (resumeData.profileInfo.fullName) completedFields++;
    if (resumeData.profileInfo.designation) completedFields++;
    if (resumeData.profileInfo.summary) completedFields++;

    // Contact Info
    totalFields += 2;
    if (resumeData.contactInfo.email) completedFields++;
    if (resumeData.contactInfo.phone) completedFields++;

    // Work Experience
    resumeData.workExperience.forEach((exp) => {
      totalFields += 5;
      if (exp.company) completedFields++;
      if (exp.role) completedFields++;
      if (exp.startDate) completedFields++;
      if (exp.endDate) completedFields++;
      if (exp.description) completedFields++;
    });

    // Education
    resumeData.education.forEach((edu) => {
      totalFields += 4;
      if (edu.degree) completedFields++;
      if (edu.institution) completedFields++;
      if (edu.startDate) completedFields++;
      if (edu.endDate) completedFields++;
    });

    // Skills
    resumeData.skills.forEach((skill) => {
      totalFields += 2;
      if (skill.name) completedFields++;
      if (skill.progress > 0) completedFields++;
    });

    // Projects
    resumeData.projects.forEach((project) => {
      totalFields += 4;
      if (project.title) completedFields++;
      if (project.description) completedFields++;
      if (project.github) completedFields++;
      if (project.liveDemo) completedFields++;
    });

    // Certifications
    resumeData.certifications.forEach((cert) => {
      totalFields += 3;
      if (cert.title) completedFields++;
      if (cert.issuer) completedFields++;
      if (cert.year) completedFields++;
    });

    // Languages
    resumeData.languages.forEach((lang) => {
      totalFields += 2;
      if (lang.name) completedFields++;
      if (lang.progress > 0) completedFields++;
    });

    // Interests
    totalFields += resumeData.interests.length;
    completedFields += resumeData.interests.filter(
      (i) => i.trim() !== ""
    ).length;

    const percentage = Math.round((completedFields / totalFields) * 100);
    setCompletionPercentage(percentage);
    return percentage;
  };

  useEffect(() => {
    calculateCompletion();
  }, [resumeData]);

  // Auto-save functionality with better logic
  useEffect(() => {
    // Mark that there are unsaved changes
    setHasUnsavedChanges(true);

    const autoSave = setTimeout(() => {
      // Only auto-save if we have a resume ID, title, and the resume has been loaded
      // Also skip auto-save if we're on the last step (additionalInfo) to prevent conflicts
      if (
        resumeId &&
        resumeData.title &&
        resumeData.profileInfo.fullName !== "" &&
        currentPage !== "additionalInfo" &&
        hasUnsavedChanges &&
        !isAutoSaving
      ) {
        console.log("Auto-saving triggered by data change");
        saveResumeProgress();
      }
    }, 5000); // Increased timeout to 5 seconds to reduce frequency

    return () => clearTimeout(autoSave);
  }, [resumeData, resumeId, currentPage, hasUnsavedChanges, isAutoSaving]);

  // Save resume progress without uploading images
  const saveResumeProgress = async () => {
    if (!resumeId) return;

    // Basic validation to prevent saving invalid data
    if (!resumeData.title || !resumeData.profileInfo.fullName) {
      console.log("Skipping auto-save due to missing required data");
      return;
    }

    try {
      setIsAutoSaving(true);

      const processedData = processResumeDataForBackend(
        resumeData,
        completionPercentage
      );

      // Additional validation for processed data
      if (!processedData) {
        console.log("Skipping auto-save due to data processing error");
        return;
      }

      console.log("Auto-saving resume data:", processedData);

      await axiosInstance.put(API_PATHS.RESUME.UPDATE(resumeId), processedData);
      console.log("Auto-save successful");
      setHasUnsavedChanges(false); // Clear unsaved changes flag
      // Silent save - no toast notification to avoid spam
    } catch (error) {
      console.error("Error saving progress:", error);
      console.error("Error response:", error.response?.data);

      // Only show error toast for critical errors, not for auto-save failures
      // This prevents annoying toasts when user is actively filling the form
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      }
      // For other errors, just log them without showing toast to avoid interrupting user flow
    } finally {
      setIsAutoSaving(false);
    }
  };

  // Save and exit without generating thumbnail
  const saveAndExit = async () => {
    try {
      setIsLoading(true);

      const processedData = processResumeDataForBackend(
        resumeData,
        completionPercentage
      );

      await axiosInstance.put(API_PATHS.RESUME.UPDATE(resumeId), processedData);
      setHasUnsavedChanges(false); // Clear unsaved changes flag
      toast.success("Resume saved successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving resume:", error);
      toast.error("Failed to save resume");
    } finally {
      setIsLoading(false);
    }
  };

  const validateAndNext = (e) => {
    const errors = [];

    switch (currentPage) {
      case "profile-info":
        const { fullName, designation, summary } = resumeData.profileInfo;
        if (!fullName.trim()) errors.push("Full Name is required");
        if (!designation.trim()) errors.push("Designation is required");
        if (!summary.trim()) errors.push("Summary is required");
        break;

      case "contact-info":
        const { email, phone } = resumeData.contactInfo;
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email))
          errors.push("Valid email is required.");
        if (!phone.trim() || !/^\d{10}$/.test(phone))
          errors.push("Valid 10-digit phone number is required");
        break;

      case "work-experience":
        resumeData.workExperience.forEach(
          ({ company, role, startDate, endDate }, index) => {
            if (!company || !company.trim())
              errors.push(`Company is required in experience ${index + 1}`);
            if (!role || !role.trim())
              errors.push(`Role is required in experience ${index + 1}`);
            if (!startDate || !endDate)
              errors.push(
                `Start and End dates are required in experience ${index + 1}`
              );
          }
        );
        break;

      case "education-info":
        resumeData.education.forEach(
          ({ degree, institution, startDate, endDate }, index) => {
            if (!degree.trim())
              errors.push(`Degree is required in education ${index + 1}`);
            if (!institution.trim())
              errors.push(`Institution is required in education ${index + 1}`);
            if (!startDate || !endDate) {
              errors.push(
                `Start and End dates are required in education ${index + 1}`
              );
            } else {
              // Convert date strings to Date objects for validation
              const start = new Date(startDate + "-01"); // Add day since input is YYYY-MM
              const end = new Date(endDate + "-01");
              if (start >= end) {
                errors.push(
                  `End date must be after start date in education ${index + 1}`
                );
              }
            }
          }
        );
        break;

      case "skills":
        resumeData.skills.forEach(({ name, progress }, index) => {
          if (!name.trim())
            errors.push(`Skill name is required in skill ${index + 1}`);
          if (progress < 1 || progress > 100)
            errors.push(
              `Skill progress must be between 1 and 100 in skill ${index + 1}`
            );
        });
        break;

      case "projects":
        resumeData.projects.forEach(({ title, description }, index) => {
          if (!title.trim())
            errors.push(`Project Title is required in project ${index + 1}`);
          if (!description.trim())
            errors.push(
              `Project description is required in project ${index + 1}`
            );
        });
        break;

      case "certifications":
        resumeData.certifications.forEach(({ title, issuer }, index) => {
          if (!title.trim())
            errors.push(
              `Certification Title is required in certification ${index + 1}`
            );
          if (!issuer.trim())
            errors.push(`Issuer is required in certification ${index + 1}`);
        });
        break;

      case "additionalInfo":
        if (
          resumeData.languages.length === 0 ||
          !resumeData.languages[0].name?.trim()
        ) {
          errors.push("At least one language is required");
        }
        if (
          resumeData.interests.length === 0 ||
          !resumeData.interests[0]?.trim()
        ) {
          errors.push("At least one interest is required");
        }
        break;

      default:
        break;
    }

    if (errors.length > 0) {
      setErrorMsg(errors.join(", "));
      return;
    }

    setErrorMsg("");
    goToNextStep();
  };

  const goToNextStep = () => {
    const pages = [
      "profile-info",
      "contact-info",
      "work-experience",
      "education-info",
      "skills",
      "projects",
      "certifications",
      "additionalInfo",
    ];

    if (currentPage === "additionalInfo") {
      setOpenPreviewModal(true);
      return;
    }

    const currentIndex = pages.indexOf(currentPage);
    if (currentIndex !== -1 && currentIndex < pages.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentPage(pages[nextIndex]);

      // Calculate progress based on current step (0-100)
      const percent = Math.round(((nextIndex + 1) / pages.length) * 100);
      setProgress(percent);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    const pages = [
      "profile-info",
      "contact-info",
      "work-experience",
      "education-info",
      "skills",
      "projects",
      "certifications",
      "additionalInfo",
    ];

    if (currentPage === "profile-info") {
      navigate("/dashboard");
      return;
    }

    const currentIndex = pages.indexOf(currentPage);
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentPage(pages[prevIndex]);

      // Calculate progress based on current step (0-100)
      const percent = Math.round(((prevIndex + 1) / pages.length) * 100);
      setProgress(percent);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderForm = () => {
    switch (currentPage) {
      case "profile-info":
        return (
          <ProfileInfoForm
            profileData={resumeData?.profileInfo}
            updateSection={(key, value) =>
              updateSection("profileInfo", key, value)
            }
            onNext={validateAndNext}
          />
        );

      case "contact-info":
        return (
          <ContactInfoForm
            contactInfo={resumeData?.contactInfo}
            updateSection={(key, value) =>
              updateSection("contactInfo", key, value)
            }
          />
        );

      case "work-experience":
        return (
          <WorkExperienceForm
            workExperience={resumeData?.workExperience}
            updateArrayItem={(index, key, value) => {
              updateArrayItem("workExperience", index, key, value);
            }}
            addArrayItem={(newItem) => addArrayItem("workExperience", newItem)}
            removeArrayItem={(index) =>
              removeArrayItem("workExperience", index)
            }
          />
        );

      case "education-info":
        return (
          <EducationDetailsForm
            educationInfo={resumeData?.education}
            updateArrayItem={(index, key, value) => {
              updateArrayItem("education", index, key, value);
            }}
            addArrayItem={(newItem) => addArrayItem("education", newItem)}
            removeArrayItem={(index) => removeArrayItem("education", index)}
          />
        );

      case "skills":
        return (
          <SkillsInfoForm
            skillsInfo={resumeData?.skills}
            updateArrayItem={(index, key, value) => {
              updateArrayItem("skills", index, key, value);
            }}
            addArrayItem={(newItem) => addArrayItem("skills", newItem)}
            removeArrayItem={(index) => removeArrayItem("skills", index)}
          />
        );

      case "projects":
        return (
          <ProjectDetailForm
            projectInfo={resumeData?.projects}
            updateArrayItem={(index, key, value) => {
              updateArrayItem("projects", index, key, value);
            }}
            addArrayItem={(newItem) => addArrayItem("projects", newItem)}
            removeArrayItem={(index) => removeArrayItem("projects", index)}
          />
        );

      case "certifications":
        return (
          <CertificationInfoForm
            certifications={resumeData?.certifications}
            updateArrayItem={(index, key, value) => {
              updateArrayItem("certifications", index, key, value);
            }}
            addArrayItem={(newItem) => addArrayItem("certifications", newItem)}
            removeArrayItem={(index) =>
              removeArrayItem("certifications", index)
            }
          />
        );

      case "additionalInfo":
        return (
          <AdditionalInfoForm
            languages={resumeData.languages}
            interests={resumeData.interests}
            updateArrayItem={(section, index, key, value) =>
              updateArrayItem(section, index, key, value)
            }
            addArrayItem={(section, newItem) => addArrayItem(section, newItem)}
            removeArrayItem={(section, index) =>
              removeArrayItem(section, index)
            }
          />
        );

      default:
        return null;
    }
  };

  const updateSection = (section, key, value) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const addArrayItem = (section, newItem) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: [...prev[section], newItem],
    }));
  };

  const removeArrayItem = (section, index) => {
    setResumeData((prev) => {
      const updatedArray = [...prev[section]];
      updatedArray.splice(index, 1);
      return {
        ...prev,
        [section]: updatedArray,
      };
    });
  };

  const updateArrayItem = (section, index, key, value) => {
    setResumeData((prev) => {
      const updatedArray = [...prev[section]];

      if (key === null) {
        updatedArray[index] = value;
      } else {
        updatedArray[index] = {
          ...updatedArray[index],
          [key]: value,
        };
      }

      return {
        ...prev,
        [section]: updatedArray,
      };
    });
  };

  const fetchResumeDetailsById = async () => {
    if (!resumeId) return;

    try {
      console.log("Fetching resume with ID:", resumeId);
      const response = await axiosInstance.get(
        API_PATHS.RESUME.GET_BY_ID(resumeId)
      );
      console.log("Resume data fetched:", response.data);

      if (response.data && response.data.profileInfo) {
        const resumeInfo = response.data;

        // Ensure template is a string (for backward compatibility)
        if (
          typeof resumeInfo.template === "object" &&
          resumeInfo.template.theme
        ) {
          resumeInfo.template = resumeInfo.template.theme;
        }

        // Set default template if not present
        if (!resumeInfo.template) {
          resumeInfo.template = "01";
        }

        // Ensure colorPalette is an array
        if (!resumeInfo.colorPalette) {
          resumeInfo.colorPalette = [];
        }

        // Process dates for frontend display
        const processedResumeInfo = processResumeDataFromBackend(resumeInfo);

        console.log("Processed resume data:", processedResumeInfo);
        setResumeData(processedResumeInfo);
        setHasUnsavedChanges(false); // Reset unsaved changes flag when data is loaded
      }
    } catch (error) {
      console.error("Error fetching resume:", error);
      if (error.response?.status === 404) {
        toast.error("Resume not found. Redirecting to dashboard...");
        navigate("/dashboard");
      } else {
        setErrorMsg("Failed to load resume data");
        toast.error("Failed to load resume data");
      }
    }
  };

  const uploadResumeImages = async () => {
    try {
      setIsLoading(true);

      const thumbnailElement = thumbnailRef.current;
      if (!thumbnailElement) {
        throw new Error("Thumbnail element not found");
      }

      // Create a more robust clone for html2canvas
      const clonedElement = thumbnailElement.cloneNode(true);

      // Set up the clone for rendering
      clonedElement.style.position = "absolute";
      clonedElement.style.left = "-9999px";
      clonedElement.style.top = "-9999px";
      clonedElement.style.width = `${thumbnailElement.offsetWidth}px`;
      clonedElement.style.height = `${thumbnailElement.offsetHeight}px`;
      clonedElement.style.visibility = "hidden";

      document.body.appendChild(clonedElement);

      let thumbnailCanvas;
      try {
        thumbnailCanvas = await html2canvas(clonedElement, {
          scale: 0.5,
          backgroundColor: "#FFFFFF",
          logging: false,
          useCORS: true,
          allowTaint: true,
        });
      } catch (canvasError) {
        console.error("html2canvas error:", canvasError);
        // Try with the original element if clone fails
        thumbnailCanvas = await html2canvas(thumbnailElement, {
          scale: 0.5,
          backgroundColor: "#FFFFFF",
          logging: false,
          useCORS: true,
          allowTaint: true,
        });
      } finally {
        // Clean up the cloned element
        if (document.body.contains(clonedElement)) {
          document.body.removeChild(clonedElement);
        }
      }

      const thumbnailDataUrl = thumbnailCanvas.toDataURL("image/png");
      const thumbnailFile = dataURLtoFile(
        thumbnailDataUrl,
        `thumbnail-${resumeId}.png`
      );

      const formData = new FormData();
      formData.append("thumbnail", thumbnailFile);

      // Check if the upload endpoint exists
      try {
        const uploadResponse = await axiosInstance.put(
          API_PATHS.RESUME.UPLOAD_IMAGES(resumeId),
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        const { thumbnailLink } = uploadResponse.data;
        await updateResumeDetails(thumbnailLink);
      } catch (uploadError) {
        console.error("Upload error:", uploadError);
        // If upload fails, try to save without thumbnail
        console.log("Attempting to save without thumbnail...");
        await updateResumeDetails("");
      }

      toast.success("Resume Updated Successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error Uploading Images:", error);

      // Provide more specific error messages
      if (error.message.includes("Thumbnail element not found")) {
        toast.error("Unable to generate thumbnail. Please try again.");
      } else if (error.response?.status === 404) {
        toast.error("Upload endpoint not found. Saving without thumbnail...");
        try {
          await updateResumeDetails("");
          toast.success("Resume saved successfully (without thumbnail)");
          navigate("/dashboard");
        } catch (saveError) {
          toast.error("Failed to save resume");
        }
      } else {
        toast.error("Failed to upload images. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const updateResumeDetails = async (thumbnailLink) => {
    try {
      setIsLoading(true);

      const processedData = processResumeDataForBackend(
        resumeData,
        completionPercentage
      );
      processedData.thumbnailLink = thumbnailLink || "";

      await axiosInstance.put(API_PATHS.RESUME.UPDATE(resumeId), processedData);
    } catch (err) {
      console.error("Error updating resume:", err);
      toast.error("Failed to update resume details");
    } finally {
      setIsLoading(false);
    }
  };
  const downloadPDF = async () => {
    const element = resumeDownloadRef.current;
    if (!element) {
      toast.error("Failed to generate PDF. Please try again.");
      return;
    }

    setIsDownloading(true);
    setDownloadSuccess(false);
    const toastId = toast.loading("Generating PDFâ€¦");

    const override = document.createElement("style");
    override.id = "__pdf_color_override__";
    override.textContent = `
      * {
        color: #000 !important;
        background-color: #fff !important;
        border-color: #000 !important;
      }
    `;
    document.head.appendChild(override);

    try {
      await html2pdf()
        .set({
          margin: 0,
          filename: `${resumeData.title.replace(/[^a-z0-9]/gi, "_")}.pdf`,
          image: { type: "png", quality: 1.0 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#FFFFFF",
            logging: false,
            windowWidth: element.scrollWidth,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
          pagebreak: {
            mode: ["avoid-all", "css", "legacy"],
          },
        })
        .from(element)
        .save();

      toast.success("PDF downloaded successfully!", { id: toastId });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("PDF error:", err);
      toast.error(`Failed to generate PDF: ${err.message}`, { id: toastId });
    } finally {
      document.getElementById("__pdf_color_override__")?.remove();
      setIsDownloading(false);
    }
  };

  const updateTheme = (theme) => {
    console.log("Updating theme to:", theme);
    setResumeData((prev) => {
      const newData = {
        ...prev,
        template: theme,
        colorPalette: [],
      };
      console.log("New resume data after theme update:", newData);
      return newData;
    });
  };

  useEffect(() => {
    if (resumeId) {
      fetchResumeDetailsById();
    }
  }, [resumeId]);

  const handleDeleteResume = async () => {
    try {
      setIsLoading(true);
      console.log("Attempting to delete resume with ID:", resumeId);
      await axiosInstance.delete(API_PATHS.RESUME.DELETE(resumeId));
      toast.success("Resume deleted successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting resume:", error);
      if (error.response?.status === 404) {
        toast.error("Resume not found or already deleted");
        navigate("/dashboard");
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to delete this resume");
      } else {
        const errorMessage =
          error.response?.data?.message || "Failed to delete resume";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className={containerStyles.main}>
        <div className={containerStyles.header}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
              <TitleInput
                title={resumeData.title}
                setTitle={(value) => {
                  setResumeData((prev) => ({
                    ...prev,
                    title: value,
                  }));
                }}
              ></TitleInput>
            </div>
            {isAutoSaving && (
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <Loader2 size={14} className="animate-spin" />
                <span>Auto-saving...</span>
              </div>
            )}
            {hasUnsavedChanges && !isAutoSaving && (
              <div className="flex items-center gap-2 text-orange-600 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span>Unsaved changes</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className={`${buttonStyles.theme} hover:scale-105 transition-transform duration-200`}
              onClick={() => setOpenThemeSelector(true)}
            >
              <Palette size={16} />
              <span className="text-sm">Theme</span>
            </button>

            <button
              onClick={handleDeleteResume}
              className={`${buttonStyles.delete} hover:scale-105 transition-transform duration-200`}
              disabled={isLoading}
            >
              <Trash2 size={16} />
              <span className="text-sm">Delete</span>
            </button>
            <button
              onClick={() => setOpenPreviewModal(true)}
              className={`${buttonStyles.download} hover:scale-105 transition-transform duration-200`}
            >
              <Download size={16} />
              <span className="text-sm">Preview</span>
            </button>
          </div>
        </div>

        {/*Step Progress*/}
        <div className={containerStyles.grid}>
          <div className={`${containerStyles.formContainer} relative`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-lg"></div>
            <StepProgress progress={progress} />
            <div className="transition-all duration-300 ease-in-out">
              {renderForm()}
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100">
              {errorMsg && (
                <div className={`${statusStyles.error} animate-pulse`}>
                  <AlertCircle size={16} />
                  {errorMsg}
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  className={`${buttonStyles.back} hover:scale-105 transition-all duration-200`}
                  onClick={goBack}
                  disabled={isLoading}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <div className="flex gap-2">
                  {currentPage === "additionalInfo" && hasUnsavedChanges && (
                    <button
                      className={`${buttonStyles.save} hover:scale-105 transition-all duration-200`}
                      onClick={saveResumeProgress}
                      disabled={isLoading || isAutoSaving}
                      title="Save current progress"
                    >
                      {isAutoSaving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      {isAutoSaving ? "Saving..." : "Save"}
                    </button>
                  )}

                  <button
                    className={`${buttonStyles.save} hover:scale-105 transition-all duration-200`}
                    onClick={saveAndExit}
                    disabled={isLoading}
                    title="Save resume without generating thumbnail"
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {isLoading ? "Saving..." : "Save & Exit"}
                  </button>

                  <button
                    className={`${buttonStyles.next} hover:scale-105 transition-all duration-200`}
                    onClick={validateAndNext}
                    disabled={isLoading}
                  >
                    {currentPage === "additionalInfo" && <Download size={16} />}
                    {currentPage === "additionalInfo"
                      ? "Preview & Download"
                      : "Next"}
                    {currentPage !== "additionalInfo" && (
                      <ArrowLeft size={16} className="rotate-180" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className={`${containerStyles.previewContainer} relative`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-t-lg"></div>
              <div className="text-center mb-4 p-4">
                <div
                  className={`${statusStyles.completionBadge} hover:scale-105 transition-transform duration-200`}
                >
                  <div className={iconStyles.pulseDot}></div>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                    Live Preview - {completionPercentage}% Complete
                  </span>
                </div>
              </div>
              <div
                className="preview-container relative shadow-xl rounded-lg overflow-hidden"
                ref={previewContainerRef}
              >
                <div
                  className={`${containerStyles.previewInner} transition-all duration-300 ease-in-out`}
                >
                  <RenderResume
                    key={`preview-${resumeData?.template}`}
                    templateId={resumeData?.template || "01"}
                    resumeData={resumeData}
                    containerWidth={previewWidth}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*Theme Selector Modal*/}
      <Modal
        isOpen={openThemeSelector}
        onClose={() => setOpenThemeSelector(false)}
        title="🎨 Choose Your Theme"
      >
        <div className={`${containerStyles.modalContent} p-6`}>
          <div className="mb-4 text-center">
            <p className="text-gray-600 text-sm">
              Select a theme that represents your style
            </p>
          </div>
          <ThemeSelector
            selectedTheme={resumeData?.template}
            setSelectedTheme={updateTheme}
            resumeData={resumeData}
            onClose={() => setOpenThemeSelector(false)}
          />
        </div>
      </Modal>

      {/*Preview Modal*/}
      <Modal
        isOpen={openPreviewModal}
        onClose={() => setOpenPreviewModal(false)}
        title={`📄 ${resumeData.title}`}
        showActionBtn
        actionBtnText={
          isDownloading
            ? "Generating..."
            : downloadSuccess
            ? "✅ Downloaded"
            : "📥 Download PDF"
        }
        actionBtnIcon={
          isDownloading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : downloadSuccess ? (
            <Check size={16} />
          ) : (
            <DownloadIcon size={16} />
          )
        }
        onActionClick={downloadPDF}
      >
        <div className="relative">
          <div className="text-center mb-6">
            <div
              className={`${statusStyles.modalBadge} hover:scale-105 transition-transform duration-200`}
            >
              <div className={iconStyles.pulseDot}></div>
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-semibold">
                Completion: {completionPercentage}%
              </span>
            </div>
          </div>

          <div
            className={`${containerStyles.pdfPreview} shadow-2xl rounded-lg overflow-hidden`}
          >
            <div ref={resumeDownloadRef} className="a4-wrapper">
              <div className="w-full h-full">
                {" "}
                <RenderResume
                  key={`pdf-${resumeData?.template}`}
                  templateId={resumeData?.template || "01"}
                  resumeData={resumeData}
                  containerWidth={null}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/*Thumbnail error fix*/}
      <div style={{ display: "none" }} ref={thumbnailRef}>
        <div className={containerStyles.hiddenThumbnail}>
          <RenderResume
            key={`thumb-${resumeData?.template}`}
            templateId={resumeData?.template || "01"}
            resumeData={resumeData}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditResume;
