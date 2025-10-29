import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../utils/db.js';
import { User } from '../models/User.js';
import { Trip } from '../models/Trip.js';

dotenv.config();

async function run() {
  await connectToDatabase();

  await User.deleteMany({});
  await Trip.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await User.create({ name: 'Demo User', email: 'demo@example.com', passwordHash });

  const trip = await Trip.create({
    ownerId: user._id,
    title: 'Paris Getaway',
    destinations: [
      {
        name: 'Paris, France',
        placeId: 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ',
        lat: 48.8566,
        lng: 2.3522,
        startDate: new Date(),
        endDate: new Date(Date.now() + 3 * 86400000),
      },
    ],
    activities: [
      { id: 'a1', title: 'Louvre Museum', day: 1, time: '10:00', notes: 'Skip-the-line' },
      { id: 'a2', title: 'Eiffel Tower Night View', day: 1, time: '20:00' },
      { id: 'a3', title: 'Seine River Cruise', day: 2, time: '18:00' },
    ],
    expenses: [
      { id: 'e1', category: 'Flights', amount: 550, currency: 'USD' },
      { id: 'e2', category: 'Food', amount: 120, currency: 'USD' },
      { id: 'e3', category: 'Activities', amount: 90, currency: 'USD' },
    ],
  });

  console.log('Seed complete:', { user: user.email, trip: trip.title });
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


