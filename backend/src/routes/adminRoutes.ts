import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { getSystemAnalytics, logAdminEvent } from '../controllers/adminController';

const router = Router();

// Protected Admin dashboard endpoints
router.get('/analytics', requireAuth, requireAdmin, getSystemAnalytics);
router.post('/log', requireAuth, requireAdmin, logAdminEvent);

export default router;
