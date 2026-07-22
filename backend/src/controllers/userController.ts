import { Request, Response } from 'express';
import { adminDb } from '../lib/firebaseAdmin';

// Simple in-memory storage fallback for local development without Firebase credentials
const localUserMemory: Record<string, any> = {};

export const getProfile = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  // Fallback to local memory if Firebase Admin DB is not initialized or in mock mode
  if (!adminDb || uid.startsWith('mock-')) {
    const mockProfile = localUserMemory[uid] || {
      email: req.user?.email || '',
      firstName: '',
      lastName: '',
      phone: '',
      website: '',
      linkedin: '',
      github: '',
      currentTitle: '',
      summary: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return res.status(200).json(mockProfile);
  }

  try {
    const userDocRef = adminDb.collection('users').doc(uid);
    const doc = await userDocRef.get();

    if (!doc.exists) {
      // Return a blank default profile
      const newProfile = {
        email: req.user?.email || '',
        firstName: '',
        lastName: '',
        phone: '',
        website: '',
        linkedin: '',
        github: '',
        currentTitle: '',
        summary: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return res.status(200).json(newProfile);
    }

    res.status(200).json(doc.data());
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  const {
    firstName,
    lastName,
    phone,
    website,
    linkedin,
    github,
    currentTitle,
    summary,
  } = req.body;

  const profileData = {
    email: req.user?.email || '',
    firstName: firstName || '',
    lastName: lastName || '',
    phone: phone || '',
    website: website || '',
    linkedin: linkedin || '',
    github: github || '',
    currentTitle: currentTitle || '',
    summary: summary || '',
    updatedAt: new Date().toISOString(),
  };

  // Fallback to local memory if Firebase Admin DB is not initialized or in mock mode
  if (!adminDb || uid.startsWith('mock-')) {
    const existing = localUserMemory[uid] || { createdAt: new Date().toISOString() };
    localUserMemory[uid] = {
      ...existing,
      ...profileData,
    };
    return res.status(200).json({ message: 'Profile updated successfully (Mock DB)', profile: localUserMemory[uid] });
  }

  try {
    const userDocRef = adminDb.collection('users').doc(uid);
    
    // Check if user doc exists to handle setting createdAt
    const doc = await userDocRef.get();
    let finalProfile;

    if (!doc.exists) {
      finalProfile = {
        ...profileData,
        createdAt: new Date().toISOString(),
      };
    } else {
      finalProfile = {
        ...profileData,
        createdAt: doc.data()?.createdAt || new Date().toISOString(),
      };
    }

    await userDocRef.set(finalProfile, { merge: true });
    res.status(200).json({ message: 'Profile updated successfully', profile: finalProfile });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};
