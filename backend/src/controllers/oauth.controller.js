import asyncHandler from '../middlewares/asyncHandler.js';
import { OAuthService } from '../services/oauth.service.js';
import ApiError from '../utils/ApiError.js';

const oauthService = new OAuthService();

export const kakaoLogin = asyncHandler(async (req, res) => {
  const { kakaoId, email, name, avatarUrl, role } = req.body;
  const user = await oauthService.loginWithKakao({ kakaoId, email, name, avatarUrl, role });
  const tokens = oauthService.issueTokens(user);
  res.status(200).json({ data: { user, tokens } });
});

export const kakaoCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;
  const { user, tokens } = await oauthService.handleKakaoCallback(code);
  const redirectBase = process.env.KAKAO_FRONTEND_REDIRECT || process.env.KAKAO_REDIRECT_URI || '/';

  const cookieOpts = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000 // 1h
  };

  res
    .cookie('accessToken', tokens.accessToken, cookieOpts)
    .cookie(
      'refreshToken',
      tokens.refreshToken,
      { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 }
    )
    .redirect(redirectBase);
});

export const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) throw new ApiError(401, 'Refresh token required');

  const { user, tokens } = await oauthService.refreshTokens(refreshToken);

  const cookieOpts = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000 // 1h
  };

  res
    .cookie('accessToken', tokens.accessToken, cookieOpts)
    .cookie(
      'refreshToken',
      tokens.refreshToken,
      { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 }
    )
    .json({ data: { user, tokens } });
});

export const googleCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;
  const { user, tokens } = await oauthService.handleGoogleCallback(code);
  const redirectBase = process.env.GOOGLE_FRONTEND_REDIRECT || process.env.GOOGLE_REDIRECT_URI || '/';

  const cookieOpts = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000 // 1h
  };

  res
    .cookie('accessToken', tokens.accessToken, cookieOpts)
    .cookie(
      'refreshToken',
      tokens.refreshToken,
      { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 }
    )
    .redirect(redirectBase);
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) throw new ApiError(401, 'Refresh token required');

  const { user, tokens } = await oauthService.refreshTokens(refreshToken);

  const cookieOpts = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000 // 1h
  };

  res
    .cookie('accessToken', tokens.accessToken, cookieOpts)
    .cookie(
      'refreshToken',
      tokens.refreshToken,
      { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 }
    )
    .json({ data: { user, tokens } });
});
