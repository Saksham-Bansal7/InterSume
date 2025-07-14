# InterSume 🚀

A comprehensive web application for building professional resumes and preparing for interviews with AI-powered personalized questions.

![InterSume Banner](https://img.shields.io/badge/InterSume-Resume%20Builder-purple?style=for-the-badge&logo=react)

## ✨ Features

### 📄 Resume Builder

- **Professional Templates**: Choose from multiple responsive resume templates
- **Real-time Preview**: See your resume update in real-time as you edit
- **Customizable Sections**: Add/remove sections like experience, education, skills, projects
- **Export Options**: Download your resume as PDF

### 🤖 AI-Powered Interview Preparation

- **Smart PDF Analysis**: Upload your resume and get personalized interview questions
- **Groq AI Integration**: Powered by advanced AI to generate relevant questions
- **Sample Answers**: Get AI-generated sample answers based on your resume content
- **Question Categories**: Organized by Technical, Experience, Projects, and Skills

### 👤 User Management

- **Secure Authentication**: JWT-based login and registration system
- **User Dashboard**: Manage your resumes and interview preparations
- **Cloud Storage**: Save your data securely in MongoDB
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend

- **React 19** - Modern UI library
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React & React Feather** - Beautiful icons

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling

### AI Integration

- **Groq SDK** - AI-powered question generation
- **PDF.js** - PDF text extraction
- **Advanced NLP** - Resume content analysis

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- Groq API key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Saksham-Bansal7/InterSume.git
   cd InterSume
   ```

2. **Install Backend Dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**

   **Backend (backend/.env):**

   ```env
   JWT_SECRET="your_secure_jwt_secret_here"
   DB_CONNECTION_STRING="your_mongodb_connection_string"
   ```

   **Frontend (frontend/.env):**

   ```env
   VITE_GROQ_API_KEY="your_groq_api_key_here"
   ```

5. **Start the Application**

   **Backend:**

   ```bash
   cd backend
   npm start
   ```

   **Frontend:**

   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

## 📱 Usage

### Building a Resume

1. **Sign Up/Login** to your account
2. **Create New Resume** from the dashboard
3. **Choose Template** that suits your style
4. **Fill in Details** - personal info, experience, education, skills
5. **Preview & Edit** in real-time
6. **Download PDF** when ready

### AI Interview Preparation

1. **Navigate to "Prepare with AI"** from the navbar
2. **Upload Your Resume** (PDF format)
3. **Wait for Processing** - AI analyzes your resume
4. **Get Personalized Questions** (5-12 questions based on your profile)
5. **Click Questions** to reveal AI-generated sample answers
6. **Practice & Prepare** for your interviews

## 🎨 Resume Templates

- **Template 1**: Clean and professional design
- **Template 2**: Modern with accent colors
- **Template 3**: Minimalist and elegant
- **Responsive**: All templates work on any device

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Cross-origin request security
- **Environment Variables**: Sensitive data protection
