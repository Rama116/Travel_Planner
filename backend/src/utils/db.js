import mongoose from 'mongoose';

export async function connectToDatabase() {
  const mongoUri = process.env.MONGO_URI || 'mongodb+srv://travel_plan:travel7712@travel.xv3bjgh.mongodb.net/?appName=travel://127.0.0.1:27017/travel_planner';
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000,
  });
  // console.log('✅ Connected to MongoDB at', mongoUri);
}


