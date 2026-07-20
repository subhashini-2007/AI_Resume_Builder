import { Request, Response } from 'express';
import { adminDb } from '../lib/firebaseAdmin';

export const getSystemAnalytics = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  // Fallback if running in mock mode (no Firestore Admin DB)
  if (!adminDb) {
    return res.status(200).json({
      metrics: {
        users: 12,
        resumes: 24,
        aiCalls: 85,
        atsScans: 40,
        pdfDownloads: 32
      },
      message: 'System analytics retrieved successfully (Mock DB)'
    });
  }

  try {
    // Count collections using standard query snapshots or aggregate queries
    const [usersSnap, resumesSnap, aiSnap, atsSnap, pdfSnap] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('resumes').get(),
      adminDb.collection('aiResults').get(),
      adminDb.collection('atsReports').get(),
      adminDb.collection('pdfMetadata').get()
    ]);

    const metrics = {
      users: usersSnap.size,
      resumes: resumesSnap.size,
      aiCalls: aiSnap.size,
      atsScans: atsSnap.size,
      pdfDownloads: pdfSnap.size
    };

    // Log admin read event
    await adminDb.collection('adminLogs').add({
      adminId: uid,
      action: 'VIEW_ANALYTICS',
      details: 'Admin loaded system analytics charts metrics',
      createdAt: new Date().toISOString()
    });

    res.status(200).json({ metrics });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const logAdminEvent = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  const { action, details } = req.body;
  if (!action) {
    return res.status(400).json({ error: 'Bad Request', message: 'Action details are required.' });
  }

  try {
    if (adminDb) {
      await adminDb.collection('adminLogs').add({
        adminId: uid,
        action,
        details: details || '',
        createdAt: new Date().toISOString()
      });
    }
    res.status(201).json({ message: 'Admin event logged successfully' });
  } catch (error: any) {
    console.error('Error logging admin action:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};
