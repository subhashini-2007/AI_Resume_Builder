import { Request, Response, NextFunction } from 'express';
import { adminDb } from '../lib/firebaseAdmin';

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
  }

  // Developer Mock bypass
  if (uid === 'mock-admin-uid' || uid === 'mock-user-uid') {
    return next(); // allow dev local operations
  }

  // Fallback to bypass if Firebase Admin DB is not initialized
  if (!adminDb) {
    return next();
  }

  try {
    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(403).json({ error: 'Forbidden', message: 'User profile does not exist.' });
    }

    const userData = userDoc.data();
    if (userData?.role === 'admin' || userData?.isAdmin === true) {
      return next();
    }

    res.status(403).json({ error: 'Forbidden', message: 'Admin privileges are required to access this resource.' });
  } catch (error) {
    console.error('Error verifying admin privileges:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Error checking admin permissions.' });
  }
};
