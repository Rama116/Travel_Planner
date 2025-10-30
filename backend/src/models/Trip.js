import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    placeId: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { _id: false }
);

const activitySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    time: { type: String },
    notes: { type: String },
    day: { type: Number, required: true },
    type: { type: String, enum: ['food','travel','sightseeing','stay','other'], default: 'other' },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    notes: { type: String },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    tripStartDate: { type: Date },
    tripEndDate: { type: Date },
    notes: { type: String },
    highlights: { type: String },
    destinations: [destinationSchema],
    activities: [activitySchema],
    expenses: [expenseSchema],
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const Trip = mongoose.model('Trip', tripSchema);


