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
  } catch (error) {
    console.error('Failed to initialize Gemini Client for Cover Letter:', error);
  }
}

// In-memory fallback for local development
const localCoverLetterMemory: Record<string, any> = {};

export const generateCoverLetter = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  const { resumeId, resumeData, jobDescription, companyName, recipientName } = req.body;
  if (!resumeId) {
    return res.status(400).json({ error: 'Bad Request', message: 'No resume ID provided.' });
  }

  const company = companyName || 'Target Company';
  const recipient = recipientName || 'Hiring Manager';

  const prompt = `You are an expert career coach. Draft a tailored, professional 3-4 paragraph cover letter for a role at "${company}".
  Address it to "${recipient}".
  Use the candidate's resume credentials to highlight alignment:
  Resume Details: ${JSON.stringify(resumeData || {})}
  Job Description: "${jobDescription || 'Professional role matching resume skills.'}"
  
  Keep the letter engaging, formal, and impact-driven. Return ONLY the cover letter text, with no introductory text, surrounding quotation marks, headers, or metadata.`;

  let letterContent = '';

  // Fallback if running in mock mode
  if (!aiClient) {
    const personal = resumeData?.personalInfo || {};
    const name = personal.firstName ? `${personal.firstName} ${personal.lastName}` : 'Candidate Name';
    const email = personal.email || 'candidate@example.com';
    const phone = personal.phone || '(555) 000-0000';

    letterContent = `Dear ${recipient},

I am writing to express my enthusiastic interest in joining the team at ${company}. Based on my professional background as a ${personal.title || 'Software Specialist'} and my hands-on experience developing high-performance solutions, I am confident that I can deliver significant value to your organization.

Throughout my career, I have focused on leveraging modern technologies to optimize workflows and construct scalable systems. My expertise aligns closely with the core specifications outlined in your job posting. I have successfully delivered multiple key milestones, collaborating within agile teams to design user-centric systems.

I am particularly drawn to ${company} because of your commitment to excellence and innovation. I welcome the opportunity to discuss how my technical credentials and problem-solving capabilities can support your upcoming goals. Thank you for your time and consideration.

Sincerely,

${name}
${email} | ${phone}`;
  } else {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });
      letterContent = response.text?.trim() || '';
    } catch (error: any) {
      console.error('Error generating cover letter with Gemini:', error);
      return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  }

  const newLetter = {
    userId: uid,
    resumeId,
    companyName: company,
    recipientName: recipient,
    jobDescription: jobDescription || '',
    letterContent,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Fallback to local memory if Firebase Admin DB is not initialized
  if (!adminDb) {
    localCoverLetterMemory[resumeId] = { id: 'mock-cl-123', ...newLetter };
    return res.status(201).json({ message: 'Cover letter generated successfully (Mock DB)', coverLetter: localCoverLetterMemory[resumeId] });
  }

  try {
    // Check if letter already exists for this resume and update it, or add new
    const snapshot = await adminDb.collection('coverLetters').where('resumeId', '==', resumeId).get();
    let docId;

    if (!snapshot.empty) {
      const docRef = snapshot.docs[0].ref;
      await docRef.set(newLetter, { merge: true });
      docId = docRef.id;
    } else {
      const docRef = await adminDb.collection('coverLetters').add(newLetter);
      docId = docRef.id;
    }

    res.status(201).json({ 
      message: 'Cover letter generated successfully', 
      coverLetter: { id: docId, ...newLetter } 
    });
  } catch (error: any) {
    console.error('Error saving cover letter to Firestore, falling back to local memory:', error);
    // If it fails to save to Firestore, we can fall back to returning the mock database style response so it still succeeds for the user!
    localCoverLetterMemory[resumeId] = { id: 'mock-cl-123', ...newLetter };
    res.status(201).json({ 
      message: 'Cover letter generated successfully (Firestore Save Failed, saved to Local Memory)', 
      coverLetter: localCoverLetterMemory[resumeId],
      error: error.message
    });
  }
};

export const getCoverLetter = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  const { resumeId } = req.params;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  // Fallback to local memory if Firebase Admin DB is not initialized
  if (!adminDb) {
    const letter = localCoverLetterMemory[resumeId];
    if (!letter) {
      return res.status(404).json({ error: 'Not Found', message: 'No cover letter found for this resume.' });
    }
    return res.status(200).json(letter);
  }

  try {
    const snapshot = await adminDb.collection('coverLetters')
      .where('userId', '==', uid)
      .where('resumeId', '==', resumeId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Not Found', message: 'No cover letter found for this resume.' });
    }

    const doc = snapshot.docs[0];
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    console.error('Error fetching cover letter:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const updateCoverLetter = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  const { id } = req.params;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  const { letterContent } = req.body;

  // Fallback to local memory if Firebase Admin DB is not initialized
  if (!adminDb) {
    // Find key where resumeId has this letter (or just update local cache)
    const matchKey = Object.keys(localCoverLetterMemory).find(
      key => localCoverLetterMemory[key].id === id
    );
    if (!matchKey) {
      return res.status(404).json({ error: 'Not Found', message: 'Cover letter not found.' });
    }
    localCoverLetterMemory[matchKey].letterContent = letterContent;
    localCoverLetterMemory[matchKey].updatedAt = new Date().toISOString();
    return res.status(200).json({ message: 'Cover letter updated successfully (Mock DB)', coverLetter: localCoverLetterMemory[matchKey] });
  }

  try {
    const docRef = adminDb.collection('coverLetters').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Not Found', message: 'Cover letter not found.' });
    }

    if (doc.data()?.userId !== uid) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access to this cover letter is restricted.' });
    }

    await docRef.update({
      letterContent,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ message: 'Cover letter updated successfully' });
  } catch (error: any) {
    console.error('Error updating cover letter:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};
