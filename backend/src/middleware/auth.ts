import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebaseAdmin';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'No authorization token provided.' });
  }

  const token = authHeader.split('Bearer ')[1];

  // In development mock mode if Firebase Admin is not initialized
  if (!adminAuth) {
    if (process.env.NODE_ENV !== 'production' && token === 'mock-dev-token') {
      req.user = {
        uid: 'mock-user-123',
        email: 'mock-user@example.com',
        auth_time: Math.floor(Date.now() / 1000),
        iat: Math.floor(Date.now() / 1000),
        iss: 'firebase-mock',
        aud: 'firebase-mock-project',
        exp: Math.floor(Date.now() / 1000) + 3600,
        sub: 'mock-user-123',
        firebase: {
          identities: {},
          sign_in_provider: 'custom'
        }
      } as any;
      return next();
    }
    return res.status(503).json({ 
      error: 'Service Unavailable', 
      message: 'Authentication engine is not initialized.' 
    });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error: any) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid or expired authentication token.',
      details: error.message
    });
  }
};
