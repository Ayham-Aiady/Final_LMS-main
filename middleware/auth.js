import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';

export const authenticate = async (req, res, next) => {
  try {
    // Debug logging
    console.log('Authorization Header:', req.headers['authorization']);
    
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    console.log('Extracted Token:', token); // Debug log

    if (!token) {
      const error = new Error('Authentication token missing');
      error.statusCode = 401;
      throw error;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('Missing JWT_SECRET in environment variables');
    }

    // Verify token with better error handling
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT Verification Error:', jwtError.message);
      const error = new Error(`Invalid token: ${jwtError.message}`);
      error.statusCode = 401;
      throw error;
    }

    const user = await UserModel.findById(decoded.id);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 401;
      throw error;
    }

    if (!user.is_active) {
      const error = new Error('User account is inactive');
      error.statusCode = 403;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    next(error);
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (roles.length && (!req.user || !roles.includes(req.user.role))) {
      const error = new Error('Unauthorized access');
      console.warn(`Unauthorized access by user ID: ${req.user?.id}`);
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};