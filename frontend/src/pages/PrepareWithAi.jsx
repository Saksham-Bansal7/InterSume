import React, { useState } from "react";
import { landingPageStyles } from "../assets/dummystyle";
import { UploadCloud, Eye, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  extractTextFromPDF,
  generateQuestionsFromResume,
} from "../utils/groqService";
import InterSume from "../assets/InterSume.png";

const PrepareWithAi = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showAnswer, setShowAnswer] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPdfFile(file);
    setError(null);
    setLoading(true);
    setQuestions([]);
 
    try {
      // Extract text from PDF
      const resumeText = await extractTextFromPDF(file);

      if (!resumeText || resumeText.trim().length < 50) {
        throw new Error(
          "Could not extract enough text from PDF. Please ensure the PDF contains readable text."
        );
      }

      // Generate questions using Groq AI
      const generatedQuestions = await generateQuestionsFromResume(resumeText);
      setQuestions(generatedQuestions);
    } catch (err) {
      console.error("Error processing PDF:", err);
      setError(err.message || "Failed to process PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionClick = (id) => {
    setShowAnswer((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={landingPageStyles.container}>
      <header className={landingPageStyles.header}>
        <div className={landingPageStyles.headerContainer}>
          <div
            className={`${landingPageStyles.logoContainer} cursor-pointer`}
            onClick={() => navigate("/")}
          >
            <div className="w-18 h-18 flex items-center justify-center">
                                    <img src={InterSume} alt="InterSume Logo" className="w-18 h-18" />
                                  </div>
          </div>
        </div>
      </header>
      <main className={`${landingPageStyles.main} -mt-8`}>
        <section className={landingPageStyles.heroSection}>
          <div className={landingPageStyles.heroGrid}>
            {/* Left: Upload & Instructions */}
            <div className={`${landingPageStyles.heroLeft} flex-1 min-w-0`}>
              <div className={landingPageStyles.tagline}>Prepare with AI</div>
              <h1 className={landingPageStyles.heading}>
                <span className={landingPageStyles.headingText}>Upload</span>
                <span className={landingPageStyles.headingGradient}>
                  Your Resume
                </span>
                <span className={landingPageStyles.headingText}>
                  and Practice
                </span>
              </h1>
              <p className={landingPageStyles.description}>
                Upload your resume PDF and get AI-generated long-answer
                questions based on your skills, projects, and experience.
              </p>
              <div className={landingPageStyles.ctaButtons}>
                <label
                  htmlFor="resume-upload"
                  className={`${
                    landingPageStyles.primaryButton
                  } flex items-center gap-2 cursor-pointer ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <UploadCloud size={20} />
                  )}
                  <span className={landingPageStyles.primaryButtonContent}>
                    {loading ? "Processing..." : "Upload PDF"}
                  </span>
                  <input
                    id="resume-upload"
                    type="file"
                    accept="application/pdf"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                </label>
              </div>
              {pdfFile && !loading && (
                <div className="mt-4 text-sm text-green-500">
                  Uploaded: {pdfFile.name}
                </div>
              )}
              {error && (
                <div className="mt-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded p-3">
                  {error}
                </div>
              )}
              {loading && (
                <div className="mt-4 text-sm text-blue-500 bg-blue-50 border border-blue-200 rounded p-3">
                  Processing your resume and generating questions...
                </div>
              )}
            </div>
            {/* Right: SVG Illustration */}
            <div className={`${landingPageStyles.heroIllustration} flex-1`}>
              <div className={landingPageStyles.heroIllustrationBg}></div>
              <div className={landingPageStyles.heroIllustrationContainer}>
                <svg
                  viewBox="0 0 400 500"
                  className={landingPageStyles.svgContainer}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient
                      id="bgGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                    <linearGradient
                      id="cardGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#f8fafc" />
                    </linearGradient>
                  </defs>
                  <rect
                    x="50"
                    y="50"
                    width="300"
                    height="400"
                    rx="20"
                    className={landingPageStyles.svgRect}
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r="25"
                    className={landingPageStyles.svgCircle}
                  />
                  <rect
                    x="160"
                    y="105"
                    width="120"
                    height="8"
                    rx="4"
                    className={landingPageStyles.svgRectPrimary}
                  />
                  <rect
                    x="160"
                    y="120"
                    width="80"
                    height="6"
                    rx="3"
                    className={landingPageStyles.svgRectSecondary}
                  />
                  <rect
                    x="70"
                    y="170"
                    width="260"
                    height="4"
                    rx="2"
                    className={landingPageStyles.svgRectLight}
                  />
                  <rect
                    x="70"
                    y="185"
                    width="200"
                    height="4"
                    rx="2"
                    className={landingPageStyles.svgRectLight}
                  />
                  <rect
                    x="70"
                    y="200"
                    width="240"
                    height="4"
                    rx="2"
                    className={landingPageStyles.svgRectLight}
                  />
                  <rect
                    x="70"
                    y="230"
                    width="60"
                    height="6"
                    rx="3"
                    className={landingPageStyles.svgRectPrimary}
                  />
                  <rect
                    x="70"
                    y="250"
                    width="40"
                    height="15"
                    rx="7"
                    className={landingPageStyles.svgRectSkill}
                  />
                  <rect
                    x="120"
                    y="250"
                    width="50"
                    height="15"
                    rx="7"
                    className={landingPageStyles.svgRectSkill}
                  />
                  <rect
                    x="180"
                    y="250"
                    width="45"
                    height="15"
                    rx="7"
                    className={landingPageStyles.svgRectSkill}
                  />
                  <rect
                    x="70"
                    y="290"
                    width="80"
                    height="6"
                    rx="3"
                    className={landingPageStyles.svgRectSecondary}
                  />
                  <rect
                    x="70"
                    y="310"
                    width="180"
                    height="4"
                    rx="2"
                    className={landingPageStyles.svgRectLight}
                  />
                  <rect
                    x="70"
                    y="325"
                    width="150"
                    height="4"
                    rx="2"
                    className={landingPageStyles.svgRectLight}
                  />
                  <rect
                    x="70"
                    y="340"
                    width="200"
                    height="4"
                    rx="2"
                    className={landingPageStyles.svgRectLight}
                  />
                  <circle
                    cx="320"
                    cy="100"
                    r="15"
                    className={landingPageStyles.svgAnimatedCircle}
                  >
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      values="0,0; 0,-10; 0,0"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <rect
                    x="30"
                    y="300"
                    width="12"
                    height="12"
                    rx="6"
                    className={landingPageStyles.svgAnimatedRect}
                  >
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      values="0,0; 5,0; 0,0"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </rect>
                  <polygon
                    points="360,200 370,220 350,220"
                    className={landingPageStyles.svgAnimatedPolygon}
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      values="0 360 210; 360 360 210; 0 360 210"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </polygon>
                </svg>
              </div>
            </div>
          </div>
        </section>
        {/* Questions & AI Answers Grid */}
        {questions.length > 0 && (
          <section className={landingPageStyles.featuresSection}>
            <div className={landingPageStyles.featuresContainer}>
              <div className={landingPageStyles.featuresHeader}>
                <h2 className={landingPageStyles.featuresTitle}>
                  Your AI Practice Questions
                </h2>
                <p className={landingPageStyles.featuresDescription}>
                  Click a question to reveal the AI-generated answer.
                </p>
              </div>
              <div className={landingPageStyles.featuresGrid}>
                {questions.map((q) => (
                  <div key={q.id} className={landingPageStyles.featureCard}>
                    <div className={landingPageStyles.featureCardHover}></div>
                    <div className={landingPageStyles.featureCardContent}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full font-medium">
                          {q.category || "General"}
                        </span>
                      </div>
                      <button
                        className="w-full text-left font-semibold text-base mb-2 flex items-center gap-2 hover:text-purple-600 transition-colors"
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                        }}
                        onClick={() => handleQuestionClick(q.id)}
                      >
                        <Eye size={18} />
                        {q.question}
                      </button>
                      {showAnswer[q.id] && (
                        <div className="mt-2 p-3 rounded bg-gray-50 border border-purple-200 text-gray-800 text-sm animate-fade-in">
                          {q.answer}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default PrepareWithAi;
