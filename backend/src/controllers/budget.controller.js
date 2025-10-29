import { Trip } from '../models/Trip.js';
import { HttpError } from '../utils/error.js';

export async function getBudget(req, res, next) {
  try {
    const { id } = req.params;
    const trip = await Trip.findOne({ _id: id, ownerId: req.user._id });
    if (!trip) throw new HttpError(404, 'Trip not found');
    res.json({ expenses: trip.expenses });
  } catch (err) {
    next(err);
  }
}


