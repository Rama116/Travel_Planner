import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getBudget } from '../controllers/budget.controller.js';

const router = Router();
router.use(requireAuth);
router.get('/:id', getBudget);

export default router;


