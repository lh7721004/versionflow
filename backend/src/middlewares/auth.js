import ApiError from '../utils/ApiError.js';
import { verifyToken, verifyRefreshToken, signToken } from '../utils/jwt.js';

export default function requireAuth(req, res, next) {
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;
  const cookieOpts = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000 // 1h
  };

  // Helper to refresh access token from refresh token
  const tryRefresh = () => {
    if (!refreshToken) throw new ApiError(401, 'Authorization token required');
    const refreshPayload = verifyRefreshToken(refreshToken);
    const newAccess = signToken({
      sub: refreshPayload.sub,
      kakaoId: refreshPayload.kakaoId,
      role: refreshPayload.role
    });
    res.cookie('accessToken', newAccess, cookieOpts);
    req.user = refreshPayload;
    return next();
  };

  if (!accessToken) {
    try {
      return tryRefresh();
    } catch (err) {
      return next(err instanceof ApiError ? err : new ApiError(401, 'Invalid or expired token'));
    }
  }

  try {
    const payload = verifyToken(accessToken);
    req.user = payload;
    return next();
  } catch (err) {
    // accessToken 만료 시 refresh 시도
    if (err.name === 'TokenExpiredError') {
      try {
        return tryRefresh();
      } catch (err2) {
        return next(err2 instanceof ApiError ? err2 : new ApiError(401, 'Invalid or expired token'));
      }
    }
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}
