import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { adminDb } from '../lib/firebaseAdmin';

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const isDummyKey = !apiKey || apiKey.startsWith('dummy') || apiKey.startsWith('your');

let aiClient: GoogleGenAI | null = null;
if (!isDummyKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
    console.log('Google Gemini AI Client initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Gemini Client:', error);
  }
} else {
  console.warn('Gemini API key is not set or is a placeholder. Initializing AI endpoints in mock mode.');
}

// Logger helper to store AI transactions in Firestore
const logAiTransaction = async (userId: string, actionType: string, input: any, output: any) => {
  if (!adminDb) return;
  try {
    await adminDb.collection('aiResults').add({
      userId,
      actionType,
      inputPayload: typeof input === 'object' ? JSON.stringify(input) : input,
      outputResponse: typeof output === 'object' ? JSON.stringify(output) : output,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error logging AI transaction:', error);
  }
};

export const generateSummary = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  const { targetTitle, experience, education, skills } = req.body;

  const prompt = `You are an expert resume writer. Generate a concise, highly professional 3-4 sentence resume summary matching the target title: "${targetTitle || 'Professional'}".
  Use these details:
  Work History: ${JSON.stringify(experience || [])}
  Education: ${JSON.stringify(education || [])}
  Skills: ${JSON.stringify(skills || [])}
  
  Write in first-person plural style (or active, action-oriented third person typical of summaries). Keep it impactful, highlighting metrics if possible. Return ONLY the summary text, with no preamble, quotes, or meta-comments.`;

  // Fallback if running in mock mode
  if (!aiClient) {
    const mockSummary = `Highly accomplished ${targetTitle || 'Professional'} with experience delivering robust solutions. Proven track record of leveraging core competencies in ${skills && skills.length > 0 ? skills.slice(0, 3).join(', ') : 'modern technologies'} to optimize workflows, build scalable projects, and support business milestones. Adept at cross-functional collaboration and technical implementations to achieve high-performance results.`;
    await logAiTransaction(uid, 'summary', { targetTitle, skills }, mockSummary);
    return res.status(200).json({ summary: mockSummary, mode: 'mock' });
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt
    });

    const summaryText = response.text?.trim() || '';
    await logAiTransaction(uid, 'summary', { targetTitle, skills }, summaryText);
    res.status(200).json({ summary: summaryText });
  } catch (error: any) {
    console.error('Error generating summary with Gemini:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const polishGrammar = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Bad Request', message: 'No text provided for grammatical correction.' });
  }

  const prompt = `Correct any spelling or grammar mistakes in this resume description bullet point, and polish it to read in a professional, impact-driven voice using active action verbs.
  Text: "${text}"
  
  Return ONLY the corrected text, with no introductory text, surrounding quotation marks, or meta comments.`;

  // Fallback if running in mock mode
  if (!aiClient) {
    const mockPolished = `Spearheaded design and development workflows for core features using target technologies, resulting in an optimized user experience and improved systems efficiency.`;
    await logAiTransaction(uid, 'grammar', text, mockPolished);
    return res.status(200).json({ polishedText: mockPolished, mode: 'mock' });
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt
    });

    const polishedText = response.text?.trim() || '';
    await logAiTransaction(uid, 'grammar', text, polishedText);
    res.status(200).json({ polishedText });
  } catch (error: any) {
    console.error('Error polishing grammar with Gemini:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const checkAts = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  const { resumeId, resumeData, jobDescription } = req.body;
  if (!jobDescription || !jobDescription.trim()) {
    return res.status(400).json({ error: 'Bad Request', message: 'No job description provided for scanning.' });
  }

  const prompt = `You are an Applicant Tracking System (ATS) analyzer. Compare the following resume details with the job description.
  
  Resume: ${JSON.stringify(resumeData || {})}
  Job Description: "${jobDescription}"
  
  Evaluate the resume alignment. Extract high-value keywords (technologies, skills, frameworks) requested in the job description that are missing from the resume. Generate actionable suggestions. Compute an overall ATS matching score from 0 to 100 based on keyword overlap, job relevancy, and details completeness.
  
  Return ONLY a valid JSON object matching this structure:
  {
    "score": 75,
    "missingKeywords": ["Docker", "Kubernetes"],
    "suggestions": ["Include experience deploying on Google Cloud Run.", "List TypeScript in your skills section."]
  }
  
  Do not include markdown wrappers, notes, preamble, or any extra text. Return ONLY the JSON object.`;

  let resultJson: any = null;

  // Fallback if running in mock mode
  if (!aiClient) {
    // Parse possible keywords from job description to make it feel realistic
    const commonTech = ['node', 'react', 'typescript', 'javascript', 'firebase', 'gemini', 'docker', 'kubernetes', 'cicd', 'github', 'nextjs', 'express', 'gcp', 'aws', 'python', 'java', 'sql', 'nosql', 'graphql', 'html', 'css', 'tailwind', 'vercel', 'jest', 'playwright', 'testing'];
    const lowerDesc = jobDescription.toLowerCase();
    const parsedKeywords = commonTech.filter(tech => lowerDesc.includes(tech));
    
    // Check which ones are missing in resume
    const resumeText = JSON.stringify(resumeData).toLowerCase();
    const missing = parsedKeywords.filter(tech => !resumeText.includes(tech));
    
    // Calculate a simple match score
    const totalCount = parsedKeywords.length || 5;
    const matchedCount = totalCount - missing.length;
    const computedScore = Math.min(100, Math.max(35, Math.round((matchedCount / totalCount) * 100)));

    resultJson = {
      score: computedScore,
      missingKeywords: missing.map(m => m.charAt(0).toUpperCase() + m.slice(1)),
      suggestions: [
        `Incorporate missing skills: ${missing.slice(0, 3).join(', ')} into your resume tags.`,
        `Add specific metrics and achievements under your experience bullet points.`,
        `Tailor your professional summary to highlight alignment with target job title keywords.`
      ]
    };
  } else {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const textResponse = response.text?.trim() || '';
      resultJson = JSON.parse(textResponse);
    } catch (error: any) {
      console.error('Error with Gemini ATS scanning:', error);
      // Fallback inside catch block in case JSON parsing of Gemini output fails
      resultJson = {
        score: 60,
        missingKeywords: ['Unknown (AI Error)'],
        suggestions: ['Review text formatting and try scanning again.']
      };
    }
  }

  try {
    // Save report in Firestore
    if (adminDb) {
      await adminDb.collection('atsReports').add({
        userId: uid,
        resumeId: resumeId || 'unknown',
        jobDescription: jobDescription.substring(0, 1000), // truncate for storage limits
        score: resultJson.score,
        missingKeywords: resultJson.missingKeywords,
        suggestions: resultJson.suggestions,
        createdAt: new Date().toISOString()
      });
    }

    res.status(200).json(resultJson);
  } catch (error: any) {
    console.error('Error saving ATS report:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const checkJobMatch = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  const { resumeId, resumeData, jobDescription } = req.body;
  if (!jobDescription || !jobDescription.trim()) {
    return res.status(400).json({ error: 'Bad Request', message: 'No job description provided.' });
  }

  const prompt = `You are a Senior Recruiter. Analyze this candidate's resume and calculate how well they match the target job description.
  
  Resume: ${JSON.stringify(resumeData || {})}
  Job Description: "${jobDescription}"
  
  Evaluate semantic alignment. Return a JSON object with:
  1. "matchScore": a number from 0 to 100 representing how well their credentials, projects, and work history align with the job responsibilities.
  2. "explanation": a concise 2-sentence explanation of their key strengths and gaps.
  
  Return ONLY a valid JSON object in this format:
  {
    "matchScore": 80,
    "explanation": "The candidate has strong web engineering credentials, but lacks target experience with cloud systems."
  }
  
  Do not include markdown wrappers, notes, preamble, or any extra text. Return ONLY the JSON object.`;

  let resultJson: any = null;

  // Fallback if running in mock mode
  if (!aiClient) {
    resultJson = {
      matchScore: 82,
      explanation: `The candidate possesses excellent web development credentials aligning well with standard developer responsibilities, though additional experience in container tools would be beneficial.`
    };
  } else {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const textResponse = response.text?.trim() || '';
      resultJson = JSON.parse(textResponse);
    } catch (error: any) {
      console.error('Error with Gemini job matching:', error);
      resultJson = {
        matchScore: 70,
        explanation: 'Review resume credentials for alignment with target role details.'
      };
    }
  }

  try {
    if (adminDb) {
      await adminDb.collection('jobMatches').add({
        userId: uid,
        resumeId: resumeId || 'unknown',
        matchScore: resultJson.matchScore,
        explanation: resultJson.explanation,
        createdAt: new Date().toISOString()
      });
    }

    res.status(200).json(resultJson);
  } catch (error: any) {
    console.error('Error saving job match report:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const suggestSkills = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  const { resumeId, resumeData, jobDescription } = req.body;
  if (!jobDescription || !jobDescription.trim()) {
    return res.status(400).json({ error: 'Bad Request', message: 'No job description provided.' });
  }

  const prompt = `You are a Career Coach. Compare this resume against the target job description.
  
  Resume: ${JSON.stringify(resumeData || {})}
  Job Description: "${jobDescription}"
  
  Identify up to 3 important skills (technical, tools, or methodologies) requested in the job description that are missing from the resume. For each skill, provide an actionable tip showing how the user can include it.
  
  Return ONLY a valid JSON object matching this structure:
  {
    "suggestions": [
      { "skill": "Docker", "tip": "Mention containerizing your backend services under your projects." },
      { "skill": "Agile Scrum", "tip": "Describe working in 2-week sprints in your experience bullet points." }
    ]
  }
  
  Do not include markdown wrappers, notes, preamble, or any extra text. Return ONLY the JSON object.`;

  let resultJson: any = null;

  // Fallback if running in mock mode
  if (!aiClient) {
    resultJson = {
      suggestions: [
        { skill: 'Docker & Containers', tip: 'Mention containerizing Node.js microservices in your projects section.' },
        { skill: 'Jest Testing', tip: 'Describe implementing unit and integration testing pipelines to verify backend routes.' },
        { skill: 'Agile & CI/CD', tip: 'Detail configuring GitHub Actions workflows for continuous compilation and linting.' }
      ]
    };
  } else {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const textResponse = response.text?.trim() || '';
      resultJson = JSON.parse(textResponse);
    } catch (error: any) {
      console.error('Error with Gemini skill suggestions:', error);
      resultJson = {
        suggestions: [
          { skill: 'Cloud Deployments', tip: 'Describe deploying services onto cloud runtime environments.' }
        ]
      };
    }
  }

  try {
    if (adminDb) {
      await adminDb.collection('skillSuggestions').add({
        userId: uid,
        resumeId: resumeId || 'unknown',
        suggestions: resultJson.suggestions,
        createdAt: new Date().toISOString()
      });
    }

    res.status(200).json(resultJson);
  } catch (error: any) {
    console.error('Error saving skill suggestions report:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const generateInterviewQuestions = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  const { resumeId, resumeData } = req.body;
  if (!resumeId) {
    return res.status(400).json({ error: 'Bad Request', message: 'No resume ID provided.' });
  }

  const prompt = `You are a Technical Interviewer. Analyze the candidate's resume:
  
  Resume: ${JSON.stringify(resumeData || {})}
  
  Generate exactly 5 challenging, customized technical interview questions tailored to their experiences, projects, and skills. For each question, compile an exemplary "sampleAnswer" that demonstrates high engineering competence.
  
  Return ONLY a valid JSON object matching this structure:
  {
    "questions": [
      {
        "id": 1,
        "question": "In your project [X], how did you configure the Firebase/Express middleware to handle sessions?",
        "sampleAnswer": "I implemented an Express request handler check that parses authorization headers, verifies the ID token via admin SDK, and..."
      }
    ]
  }
  
  Do not include markdown wrappers, notes, preamble, or any extra text. Return ONLY the JSON object.`;

  let resultJson: any = null;

  // Fallback if running in mock mode
  if (!aiClient) {
    const personal = resumeData?.personalInfo || {};
    const title = personal.title || 'Software Engineer';
    resultJson = {
      questions: [
        {
          id: 1,
          question: `As a ${title}, how do you approach selecting between Firestore NoSQL and a standard relational database for client schemas?`,
          sampleAnswer: `I evaluate write/read scalability demands. Firestore is ideal for high-throughput, hierarchical data models and real-time syncing, whereas SQL is preferred for complex relational integrity and analytical queries.`
        },
        {
          id: 2,
          question: `Explain how you handle JWT authorization token verification inside Node.js Express backend routers securely.`,
          sampleAnswer: `I construct a custom authorization middleware that extracts the bearer token, verifies its signature using public keys (or Firebase Admin SDK verification), and mounts decoded user context onto the request object.`
        },
        {
          id: 3,
          question: `In your projects, what techniques do you use to optimize Next.js / React page load speeds and prevent unnecessary component re-renders?`,
          sampleAnswer: `I utilize dynamic code-splitting imports, configure appropriate cache control headers, and optimize states using React.memo, useMemo, or useCallback hooks to prevent virtual DOM recreation loops.`
        },
        {
          id: 4,
          question: `Describe a scenario where you integrated external web APIs (like Gemini or weather microservices) and how you handled connection failures or rate limits.`,
          sampleAnswer: `I implement exponential backoff retry algorithms, set strict timeouts to prevent thread blocking, and build mock backup engines to gracefully handle fallback states if the remote API drops.`
        },
        {
          id: 5,
          question: `How do you structure continuous integration pipelines (such as GitHub Actions) to automate code quality checks and tests?`,
          sampleAnswer: `I write workflows triggered on pull requests that launch linting tools, run unit test suites, and compile production bundles to block bugs before deployment.`
        }
      ]
    };
  } else {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const textResponse = response.text?.trim() || '';
      resultJson = JSON.parse(textResponse);
    } catch (error: any) {
      console.error('Error with Gemini mock interview questions:', error);
      resultJson = {
        questions: [
          {
            id: 1,
            question: 'How do you design RESTful routing schemas inside Express applications?',
            sampleAnswer: 'I organize modular Express routers protected by authentication middleware.'
          }
        ]
      };
    }
  }

  try {
    if (adminDb) {
      await adminDb.collection('interviewQuestions').add({
        userId: uid,
        resumeId,
        questions: resultJson.questions,
        createdAt: new Date().toISOString()
      });
    }

    res.status(200).json(resultJson);
  } catch (error: any) {
    console.error('Error saving mock interview questions:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};
