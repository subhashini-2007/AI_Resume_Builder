import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getProfile, updateProfile } from '../controllers/userController';
import { validateProfile } from '../middleware/validate';

const router = Router();

// Protected profile routes
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, validateProfile, updateProfile);

export default router;
