import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getItinerary } from '../controllers/itinerary.controller.js';

const router = Router();
router.use(requireAuth);
router.get('/:id', getItinerary);

export default router;


