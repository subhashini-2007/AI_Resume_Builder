import { Request, Response, NextFunction } from 'express';
import { adminDb } from '../lib/firebaseAdmin';

// Simple in-memory fallback for local development without Firebase credentials
let localResumeMemory: Record<string, any[]> = {};

// Helper to generate a random ID for mock mode
const generateId = () => Math.random().toString(36).substring(2, 15);

export const createResume = async (req: Request, res: Response, next: NextFunction) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  const { title, templateId } = req.body;

  let personalInfo = {
    firstName: '',
    lastName: '',
    email: req.user?.email || '',
    phone: '',
    website: '',
    linkedin: '',
    github: '',
    title: '',
    summary: '',
  };

  const newResume = {
    userId: uid,
    title: title || 'Untitled Resume',
    templateId: templateId || 'modern-glow',
    personalInfo,
    education: [],
    experience: [],
    skills: [],
    projects: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Fallback to local memory if Firebase Admin DB is not initialized (dev mock mode)
  if (!adminDb) {
    const resumeId = generateId();
    const createdResume = { id: resumeId, ...newResume };
    if (!localResumeMemory[uid]) {
      localResumeMemory[uid] = [];
    }
    localResumeMemory[uid].push(createdResume);
    return res.status(201).json({ message: 'Resume created successfully (Mock DB)', resume: createdResume });
  }

  try {
    // Attempt to prepopulate personalInfo from user profile
    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      newResume.personalInfo = {
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
        email: req.user?.email || userData?.email || '',
        phone: userData?.phone || '',
        website: userData?.website || '',
        linkedin: userData?.linkedin || '',
        github: userData?.github || '',
        title: userData?.currentTitle || '',
        summary: userData?.summary || '',
      };
    }

    const docRef = await adminDb.collection('resumes').add(newResume);
    res.status(201).json({ 
      message: 'Resume created successfully', 
      resume: { id: docRef.id, ...newResume } 
    });
  } catch (error: any) {
    console.error('Error creating resume:', error);
    next(error);
  }
};

export const getResumes = async (req: Request, res: Response, next: NextFunction) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  // Fallback to local memory if Firebase Admin DB is not initialized (dev mock mode)
  if (!adminDb) {
    const userResumes = localResumeMemory[uid] || [];
    return res.status(200).json(userResumes);
  }

  try {
    const snapshot = await adminDb.collection('resumes').where('userId', '==', uid).get();
    const resumes: any[] = [];
    snapshot.forEach((doc) => {
      resumes.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(resumes);
  } catch (error: any) {
    console.error('Error fetching resumes:', error);
    next(error);
  }
};

export const getResumeById = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  const { id } = req.params;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  // Fallback to local memory if Firebase Admin DB is not initialized (dev mock mode)
  if (!adminDb) {
    const userResumes = localResumeMemory[uid] || [];
    const resume = userResumes.find((r) => r.id === id);
    if (!resume) {
      return res.status(404).json({ error: 'Not Found', message: 'Resume not found.' });
    }
    return res.status(200).json(resume);
  }

  try {
    const docRef = adminDb.collection('resumes').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Not Found', message: 'Resume not found.' });
    }

    const data = doc.data();
    if (data?.userId !== uid) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access to this resume is restricted.' });
    }

    res.status(200).json({ id: doc.id, ...data });
  } catch (error: any) {
    console.error('Error fetching resume by ID:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const updateResume = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  const { id } = req.params;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  const { title, templateId, personalInfo, education, experience, skills, projects } = req.body;

  const updateData: any = {
    updatedAt: new Date().toISOString(),
  };

  if (title !== undefined) updateData.title = title;
  if (templateId !== undefined) updateData.templateId = templateId;
  if (personalInfo !== undefined) updateData.personalInfo = personalInfo;
  if (education !== undefined) updateData.education = education;
  if (experience !== undefined) updateData.experience = experience;
  if (skills !== undefined) updateData.skills = skills;
  if (projects !== undefined) updateData.projects = projects;

  // Fallback to local memory if Firebase Admin DB is not initialized (dev mock mode)
  if (!adminDb) {
    const userResumes = localResumeMemory[uid] || [];
    const index = userResumes.findIndex((r) => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Not Found', message: 'Resume not found.' });
    }

    const updatedResume = {
      ...userResumes[index],
      ...updateData,
    };
    localResumeMemory[uid][index] = updatedResume;
    return res.status(200).json({ message: 'Resume updated successfully (Mock DB)', resume: updatedResume });
  }

  try {
    const docRef = adminDb.collection('resumes').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Not Found', message: 'Resume not found.' });
    }

    if (doc.data()?.userId !== uid) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access to this resume is restricted.' });
    }

    await docRef.set(updateData, { merge: true });
    
    // Fetch latest updated doc
    const updatedDoc = await docRef.get();
    res.status(200).json({ message: 'Resume updated successfully', resume: { id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (error: any) {
    console.error('Error updating resume:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const deleteResume = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  const { id } = req.params;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  // Fallback to local memory if Firebase Admin DB is not initialized (dev mock mode)
  if (!adminDb) {
    const userResumes = localResumeMemory[uid] || [];
    const index = userResumes.findIndex((r) => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Not Found', message: 'Resume not found.' });
    }

    localResumeMemory[uid].splice(index, 1);
    return res.status(200).json({ message: 'Resume deleted successfully (Mock DB)' });
  }

  try {
    const docRef = adminDb.collection('resumes').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Not Found', message: 'Resume not found.' });
    }

    if (doc.data()?.userId !== uid) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access to this resume is restricted.' });
    }

    await docRef.delete();
    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

// In-memory fallback for revision histories
const localHistoryMemory: Record<string, any[]> = {};

export const createRevision = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  const { id } = req.params;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  const { versionName, resumeData } = req.body;
  if (!versionName || !versionName.trim()) {
    return res.status(400).json({ error: 'Bad Request', message: 'No version name provided.' });
  }

  const newRevision = {
    userId: uid,
    resumeId: id,
    versionName,
    resumeData: resumeData || {},
    createdAt: new Date().toISOString()
  };

  // Fallback to local memory if Firebase Admin DB is not initialized
  if (!adminDb) {
    if (!localHistoryMemory[id]) {
      localHistoryMemory[id] = [];
    }
    const revisionWithId = { id: `mock-rev-${Date.now()}`, ...newRevision };
    localHistoryMemory[id].unshift(revisionWithId); // add to top
    return res.status(201).json({ message: 'Revision saved successfully (Mock DB)', revision: revisionWithId });
  }

  try {
    const docRef = await adminDb.collection('resumeHistory').add(newRevision);
    res.status(201).json({ message: 'Revision snapshot saved successfully', revision: { id: docRef.id, ...newRevision } });
  } catch (error: any) {
    console.error('Error creating resume revision:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const getRevisionHistory = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  const { id } = req.params;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  // Fallback to local memory if Firebase Admin DB is not initialized
  if (!adminDb) {
    const history = localHistoryMemory[id] || [];
    return res.status(200).json(history);
  }

  try {
    const snapshot = await adminDb.collection('resumeHistory')
      .where('userId', '==', uid)
      .where('resumeId', '==', id)
      .orderBy('createdAt', 'desc')
      .get();

    const history: any[] = [];
    snapshot.forEach(doc => {
      history.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(history);
  } catch (error: any) {
    console.error('Error fetching resume history:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const restoreRevision = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  const { id, historyId } = req.params;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  // Fallback to local memory if Firebase Admin DB is not initialized
  if (!adminDb) {
    const history = localHistoryMemory[id] || [];
    const revision = history.find(rev => rev.id === historyId);
    if (!revision) {
      return res.status(404).json({ error: 'Not Found', message: 'Revision history item not found.' });
    }

    const userResumes = localResumeMemory[uid] || [];
    const index = userResumes.findIndex(r => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Not Found', message: 'Resume not found.' });
    }

    const restoredResume = {
      ...userResumes[index],
      ...revision.resumeData,
      updatedAt: new Date().toISOString()
    };
    localResumeMemory[uid][index] = restoredResume;

    return res.status(200).json({ message: 'Revision restored successfully (Mock DB)', resume: restoredResume });
  }

  try {
    const historyRef = adminDb.collection('resumeHistory').doc(historyId);
    const historyDoc = await historyRef.get();

    if (!historyDoc.exists) {
      return res.status(404).json({ error: 'Not Found', message: 'Revision history item not found.' });
    }

    const historyData = historyDoc.data();
    if (historyData?.userId !== uid) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access to this revision is restricted.' });
    }

    // Restore data back into primary resume document
    const resumeRef = adminDb.collection('resumes').doc(id);
    const resumeDoc = await resumeRef.get();

    if (!resumeDoc.exists) {
      return res.status(404).json({ error: 'Not Found', message: 'Resume not found.' });
    }

    const updatedData = {
      ...historyData.resumeData,
      updatedAt: new Date().toISOString()
    };

    await resumeRef.set(updatedData, { merge: true });

    res.status(200).json({ message: 'Revision restored successfully', resume: { id, ...updatedData } });
  } catch (error: any) {
    console.error('Error restoring resume revision:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};
