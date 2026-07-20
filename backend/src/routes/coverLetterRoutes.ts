import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { 
  generateCoverLetter, 
  getCoverLetter, 
  updateCoverLetter 
} from '../controllers/coverLetterController';

const router = Router();

// Protected cover letter routes
router.post('/', requireAuth, generateCoverLetter);
router.get('/resume/:resumeId', requireAuth, getCoverLetter);
router.put('/:id', requireAuth, updateCoverLetter);

export default router;
