import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { placesAutocomplete } from '../controllers/place.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/autocomplete', placesAutocomplete);

export default router;


