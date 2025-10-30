import mongoose from 'mongoose';

export async function connectToDatabase() {
  const mongoUri = process.env.MONGO_URI || 'mongodb+srv://travel_plan:travel7712@travel.xv3bjgh.mongodb.net/?appName=travel';
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000,
  });
  console.log('Connected to MongoDB');
}


