import React from "react";
import { Input } from "./Input";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const CreateResumeForm = () => {
  const [title, setTitle] = React.useState("");
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();
  const handleCreateResume = async (e) => {
    e.preventDefault();
    if (!title) {
      setError("Title is required");
      return;
    }
    setError("");
    try {
      const response = await axiosInstance.post(API_PATHS.RESUME.CREATE, {
        title,
      });
      if (response.data?._id) {
        navigate(`/resume/${response.data?._id}`);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message || "Failed to create resume");
      } else {
        setError("An unexpected error occurred,please try again later.");
      }
    }
  };
  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl border border-gray-100 shadow-lg">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Create New Resume
      </h3>
      <p className="text-gray-600 mb-8">
        Fill in the details below to create your resume. You can customize it
        later.
      </p>
      <form onSubmit={handleCreateResume}>
        <Input
          label="Resume Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your resume title"
          type="text"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          className="mt-4 w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700"
        >
          Create Resume
        </button>
      </form>
    </div>
  );
};

export default CreateResumeForm;
