import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { aiRateLimiter } from '../middleware/rateLimiter';
import { 
  generateSummary, 
  polishGrammar, 
  checkAts, 
  checkJobMatch, 
  suggestSkills,
  generateInterviewQuestions
} from '../controllers/aiController';

const router = Router();

// Protect all AI calls with token limits
router.use(aiRateLimiter);

// Protected AI endpoint integrations
router.post('/summary', requireAuth, generateSummary);
router.post('/grammar', requireAuth, polishGrammar);
router.post('/ats', requireAuth, checkAts);
router.post('/job-match', requireAuth, checkJobMatch);
router.post('/skill-suggestions', requireAuth, suggestSkills);
router.post('/interview', requireAuth, generateInterviewQuestions);

export default router;
