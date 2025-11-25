import jwt from 'jsonwebtoken';
import ApiError from './ApiError.js';

const DEFAULT_EXPIRES_IN = '1h';
const REFRESH_EXPIRES_IN = '7d';

export function signToken(payload, options = {}) {
  const secret = process.env.JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn: DEFAULT_EXPIRES_IN, ...options });
}

export function signRefreshToken(payload, options = {}) {
  const secret = process.env.JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn: REFRESH_EXPIRES_IN, ...options });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Invalid token');
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Invalid refresh token');
  }
}
