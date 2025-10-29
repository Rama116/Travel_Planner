import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { addActivity, addExpense, createTrip, deleteTrip, getTrip, listTrips, reorderActivities, updateNotes } from '../controllers/trip.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', listTrips);

router.post(
  '/',
  body('title').isString().isLength({ min: 2 }),
  body('destinations').optional().isArray(),
  body('tripStartDate').optional().isISO8601(),
  body('tripEndDate').optional().isISO8601(),
  createTrip
);

router.get('/:id', getTrip);
router.post('/:id/activities', addActivity);
router.put('/:id/activities/reorder', reorderActivities);
router.post('/:id/expenses', addExpense);
router.delete('/:id', deleteTrip);
router.put('/:id/notes', updateNotes);

export default router;


