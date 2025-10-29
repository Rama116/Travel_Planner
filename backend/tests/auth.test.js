import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';
import { connectToDatabase } from '../src/utils/db.js';
import { User } from '../src/models/User.js';

describe('Auth', () => {
  beforeAll(async () => {
    process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/travel_planner_test';
    await connectToDatabase();
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('registers and logs in a user', async () => {
    const email = `user${Date.now()}@example.com`;
    const registerRes = await request(app).post('/api/auth/register').send({ name: 'Test', email, password: 'password123' });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body.token).toBeDefined();

    const loginRes = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
  });
});


