import { Router } from 'express';
import { getTemplates, getTemplateById } from '../controllers/templateController';

const router = Router();

// Public template catalog discovery routes
router.get('/', getTemplates);
router.get('/:id', getTemplateById);

export default router;
