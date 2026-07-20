import { Request, Response } from 'express';
import { adminDb } from '../lib/firebaseAdmin';

// Local revision tracker fallback
const localPdfExportLogs: any[] = [];

export const trackPdfExport = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  const { resumeId, templateId, exportType } = req.body;
  if (!resumeId) {
    return res.status(400).json({ error: 'Bad Request', message: 'No resume ID provided.' });
  }

  const newLog = {
    userId: uid,
    resumeId,
    templateId: templateId || 'modern-glow',
    exportType: exportType || 'resume',
    createdAt: new Date().toISOString()
  };

  // Fallback to local memory if Firebase Admin DB is not initialized
  if (!adminDb) {
    localPdfExportLogs.push(newLog);
    return res.status(201).json({ message: 'PDF export event logged successfully (Mock DB)', log: newLog });
  }

  try {
    const docRef = await adminDb.collection('pdfMetadata').add(newLog);
    res.status(201).json({ message: 'PDF export event logged successfully', log: { id: docRef.id, ...newLog } });
  } catch (error: any) {
    console.error('Error logging PDF export event:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};
