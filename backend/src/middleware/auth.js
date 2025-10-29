import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/error.js';
import { User } from '../models/User.js';

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new HttpError(401, 'Authentication required');
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const user = await User.findById(payload.userId).select('-passwordHash');
    if (!user) throw new HttpError(401, 'Invalid token');
    req.user = user;
    next();
  } catch (err) {
    next(new HttpError(401, 'Invalid or missing token'));
  }
}


