import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { trackPdfExport } from '../controllers/pdfController';

const router = Router();

// Protected PDF logging endpoint
router.post('/generate', requireAuth, trackPdfExport);

export default router;
