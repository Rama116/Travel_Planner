import { validationResult } from 'express-validator';
import { Trip } from '../models/Trip.js';
import { HttpError } from '../utils/error.js';

export async function listTrips(req, res) {
  const trips = await Trip.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
  res.json({ trips });
}

export async function createTrip(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new HttpError(400, 'Invalid input');
    const { title, destinations, tripStartDate, tripEndDate } = req.body;
    const trip = await Trip.create({ 
      ownerId: req.user._id, 
      title, 
      tripStartDate: tripStartDate ? new Date(tripStartDate) : undefined,
      tripEndDate: tripEndDate ? new Date(tripEndDate) : undefined,
      destinations: destinations || [], 
      activities: [], 
      expenses: [] 
    });
    res.status(201).json({ trip });
  } catch (err) {
    next(err);
  }
}

export async function getTrip(req, res, next) {
  try {
    const { id } = req.params;
    const trip = await Trip.findOne({ _id: id, ownerId: req.user._id });
    if (!trip) throw new HttpError(404, 'Trip not found');
    res.json({ trip });
  } catch (err) {
    next(err);
  }
}

export async function addActivity(req, res, next) {
  try {
    const { id } = req.params;
    const { activity } = req.body;
    const trip = await Trip.findOne({ _id: id, ownerId: req.user._id });
    if (!trip) throw new HttpError(404, 'Trip not found');
    trip.activities.push(activity);
    await trip.save();
    res.status(201).json({ activities: trip.activities });
  } catch (err) {
    next(err);
  }
}

export async function reorderActivities(req, res, next) {
  try {
    const { id } = req.params;
    const { activities } = req.body; // full ordered list
    const trip = await Trip.findOne({ _id: id, ownerId: req.user._id });
    if (!trip) throw new HttpError(404, 'Trip not found');
    trip.activities = activities;
    await trip.save();
    res.json({ activities: trip.activities });
  } catch (err) {
    next(err);
  }
}

export async function addExpense(req, res, next) {
  try {
    const { id } = req.params;
    const { expense } = req.body;
    const trip = await Trip.findOne({ _id: id, ownerId: req.user._id });
    if (!trip) throw new HttpError(404, 'Trip not found');
    trip.expenses.push(expense);
    await trip.save();
    res.status(201).json({ expenses: trip.expenses });
  } catch (err) {
    next(err);
  }
}

export async function updateNotes(req, res, next) {
  try {
    const { id } = req.params;
    const { notes, highlights } = req.body;
    const trip = await Trip.findOne({ _id: id, ownerId: req.user._id });
    if (!trip) throw new HttpError(404, 'Trip not found');
    if (typeof notes === 'string') trip.notes = notes;
    if (typeof highlights === 'string') trip.highlights = highlights;
    await trip.save();
    res.json({ notes: trip.notes, highlights: trip.highlights });
  } catch (err) {
    next(err);
  }
}

export async function updateActivityCompletion(req, res, next) {
  try {
    const { id, activityId } = req.params;
    const { completed } = req.body;
    const trip = await Trip.findOne({ _id: id, ownerId: req.user._id });
    if (!trip) throw new HttpError(404, 'Trip not found');
    const activity = trip.activities.find(a => a.id === activityId);
    if (!activity) throw new HttpError(404, 'Activity not found');
    activity.completed = !!completed;
    await trip.save();
    res.json({ activities: trip.activities });
  } catch (err) {
    next(err);
  }
}

export async function deleteTrip(req, res, next) {
  try {
    const { id } = req.params;
    const trip = await Trip.findOne({ _id: id, ownerId: req.user._id });
    if (!trip) throw new HttpError(404, 'Trip not found');
    await Trip.deleteOne({ _id: id, ownerId: req.user._id });
    res.json({ message: 'Trip deleted successfully' });
  } catch (err) {
    next(err);
  }
}


