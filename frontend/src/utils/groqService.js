import Groq from 'groq-sdk';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export const generateQuestionsFromResume = async (resumeText) => {
  try {
    const prompt = `
You are an expert HR interviewer. Based on the following resume content, generate 5-12 relevant interview questions with detailed answers that would help a candidate prepare for job interviews.

Focus on:
- Technical skills and projects mentioned
- Work experience and achievements
- Educational background
- Problem-solving abilities
- Leadership and teamwork experience

Resume Content:
${resumeText}

Please respond with a JSON array of objects, each containing:
- question: A thoughtful interview question (string)
- answer: A detailed sample answer based on the resume content (string)
- category: The category of the question (e.g., "Technical", "Experience", "Projects", "Skills") (string)

Ensure the questions are:
1. Specific to the candidate's background
2. Challenging but fair
3. Cover different aspects of their profile
4. Include both behavioral and technical questions where applicable

Generate between 5-12 questions total. Return only the JSON array, no additional text.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 3000,
      top_p: 1,
      stream: false,
    });

    const response = chatCompletion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from Groq API');
    }

    // Parse the JSON response
    const questions = JSON.parse(response);
    
    // Add IDs to questions for React key prop
    return questions.map((q, index) => ({
      ...q,
      id: index + 1
    }));

  } catch (error) {
    console.error('Error generating questions from resume:', error);
    throw new Error('Failed to generate questions. Please try again.');
  }
};

export const extractTextFromPDF = async (file) => {
  try {
    console.log('Starting PDF text extraction for file:', file.name);
    
    // First, let's try a simple approach
    const arrayBuffer = await file.arrayBuffer();
    console.log('File converted to array buffer, size:', arrayBuffer.byteLength);
    
    // Create a more robust PDF loading configuration
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      verbosity: 0, // Reduce console noise
      disableAutoFetch: false,
      disableStream: false
    });
    
    const pdf = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);
    
    let fullText = '';
    let hasContent = false;
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        console.log(`Processing page ${i}/${pdf.numPages}`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        if (textContent && textContent.items && textContent.items.length > 0) {
          const pageText = textContent.items
            .map(item => {
              if (item && typeof item.str === 'string') {
                return item.str;
              }
              return '';
            })
            .filter(str => str.trim().length > 0)
            .join(' ');
          
          if (pageText.trim().length > 0) {
            fullText += pageText + '\n\n';
            hasContent = true;
            console.log(`Page ${i} text length:`, pageText.length);
          }
        }
      } catch (pageError) {
        console.warn(`Error processing page ${i}:`, pageError);
        // Continue with other pages
      }
    }
    
    const finalText = fullText.trim();
    console.log('Total extracted text length:', finalText.length);
    
    if (!hasContent || finalText.length < 10) {
      throw new Error('PDF appears to be empty, contains only images, or has no readable text. Please try a text-based PDF file.');
    }
    
    return finalText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    
    if (error.message.includes('Invalid PDF') || error.message.includes('Invalid XRef')) {
      throw new Error('Invalid or corrupted PDF file. Please ensure you\'re uploading a valid PDF document.');
    } else if (error.message.includes('password')) {
      throw new Error('PDF is password protected. Please upload an unprotected PDF file.');
    } else if (error.message.includes('readable text') || error.message.includes('empty')) {
      throw error; // Re-throw our custom message
    } else {
      throw new Error('Failed to extract text from PDF. The file might be image-based or corrupted. Please try a different PDF.');
    }
  }
};

// Test function to validate PDF extraction
export const testPDFExtraction = async (file) => {
  try {
    console.log('=== PDF EXTRACTION TEST ===');
    console.log('File name:', file.name);
    console.log('File size:', file.size);
    console.log('File type:', file.type);
    
    const text = await extractTextFromPDF(file);
    console.log('Extraction successful!');
    console.log('Text preview (first 200 chars):', text.substring(0, 200));
    return { success: true, text, preview: text.substring(0, 200) };
  } catch (error) {
    console.error('Extraction failed:', error.message);
    return { success: false, error: error.message };
  }
};
