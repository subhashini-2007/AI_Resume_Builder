import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { adminDb } from './lib/firebaseAdmin';
import userRoutes from './routes/userRoutes';
import resumeRoutes from './routes/resumeRoutes';
import templateRoutes from './routes/templateRoutes';
import aiRoutes from './routes/aiRoutes';
import coverLetterRoutes from './routes/coverLetterRoutes';
import pdfRoutes from './routes/pdfRoutes';
import adminRoutes from './routes/adminRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

import { apiRateLimiter } from './middleware/rateLimiter';

// Middleware
app.use(cors({
  origin: '*', // Adjust to specific origins in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(apiRateLimiter);

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/cover-letters', coverLetterRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/admin', adminRoutes);

// Root landing endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('<h1>AI Resume Builder Backend API</h1><p>The server is running successfully! Access the health check at <a href="/api/health">/api/health</a>.</p>');
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

let lastError: any = null;
let recentRequests: string[] = [];

// Request logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const logEntry = `${req.method} ${req.originalUrl} - Headers: ${JSON.stringify(req.headers)} - Time: ${new Date().toISOString()}`;
  recentRequests.unshift(logEntry);
  if (recentRequests.length > 30) {
    recentRequests.pop();
  }
  next();
});

// Debug endpoint to retrieve the last unhandled server error and recent request log
app.get('/api/debug', (req: Request, res: Response) => {
  res.status(200).json({
    hasError: !!lastError,
    message: lastError?.message || 'No errors registered',
    stack: lastError?.stack || null,
    env: process.env.NODE_ENV,
    adminDbInitialized: !!adminDb,
    recentRequests
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err.stack);
  lastError = err;
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
