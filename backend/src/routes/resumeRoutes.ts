import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { 
  createResume, 
  getResumes, 
  getResumeById, 
  updateResume, 
  deleteResume,
  createRevision,
  getRevisionHistory,
  restoreRevision
} from '../controllers/resumeController';
import { validateResume } from '../middleware/validate';

const router = Router();

// Protected resume CRUD routes
router.post('/', requireAuth, validateResume, createResume);
router.get('/', requireAuth, getResumes);
router.get('/:id', requireAuth, getResumeById);
router.put('/:id', requireAuth, validateResume, updateResume);
router.delete('/:id', requireAuth, deleteResume);

// Version history routes
router.post('/:id/history', requireAuth, createRevision);
router.get('/:id/history', requireAuth, getRevisionHistory);
router.post('/:id/restore/:historyId', requireAuth, restoreRevision);

export default router;
