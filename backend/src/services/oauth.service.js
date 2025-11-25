import { OAuthRepository } from '../repositories/oauth.repository.js';
import ApiError from '../utils/ApiError.js';
import { signToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

const TOKEN_EXP = '1h';
const REFRESH_EXP = '7d';

export class OAuthService {
  constructor(repo = new OAuthRepository()) {
    this.repo = repo;
  }

  async handleKakaoCallback(code) {
    if (!code) throw new ApiError(400, 'code is required');

    const token = await this.exchangeKakaoToken(code);
    const profile = await this.fetchKakaoProfile(token.access_token);

    const kakaoId = String(profile.id);
    const email = profile.kakao_account?.email;
    const name = profile.kakao_account?.profile?.nickname;
    const avatarUrl = profile.kakao_account?.profile?.profile_image_url;

    const user = await this.loginWithKakao({ kakaoId, email, name, avatarUrl });
    const tokens = this.issueTokens(user);
    return { user, tokens };
  }

  async handleGoogleCallback(code) {
    if (!code) throw new ApiError(400, 'code is required');

    const token = await this.exchangeGoogleToken(code);
    const profile = await this.fetchGoogleProfile(token.access_token);
    const googleId = String(profile.sub);
    const email = profile.email;
    const name = profile.name || profile.given_name || profile.email;
    const avatarUrl = profile.picture;

    const user = await this.loginWithGoogle({ googleId, email, name, avatarUrl });
    const tokens = this.issueTokens(user);
    return { user, tokens };
  }

  async exchangeKakaoToken(code) {
    const url = 'https://kauth.kakao.com/oauth/token';
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.KAKAO_CLIENT_ID,
      client_secret: process.env.KAKAO_CLIENT_SECRET,
      redirect_uri: process.env.KAKAO_REDIRECT_URI,
      code
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: params
    });
    if (!res.ok) throw new ApiError(400, 'Failed to exchange Kakao token');
    return res.json();
  }

  async fetchKakaoProfile(accessToken) {
    const res = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) throw new ApiError(400, 'Failed to fetch Kakao profile');
    return res.json();
  }

  async exchangeGoogleToken(code) {
    const url = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      code
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    if (!res.ok) throw new ApiError(400, 'Failed to exchange Google token');
    return res.json();
  }

  async fetchGoogleProfile(accessToken) {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) throw new ApiError(400, 'Failed to fetch Google profile');
    return res.json();
  }

  async loginWithKakao({ kakaoId, email, name, avatarUrl, role }) {
    if (!kakaoId) throw new ApiError(400, 'kakaoId is required');

    const now = new Date();
    const existing = await this.repo.findByKakaoId(kakaoId);

    if (existing) {
      const updated = await this.repo.updateById(existing._id, {
        email,
        name,
        avatarUrl,
        role,
        lastLoginAt: now
      });
      return updated.toPublic();
    }

    const created = await this.repo.create({
      kakaoId,
      email,
      name,
      avatarUrl,
      role,
      lastLoginAt: now
    });

    return created.toPublic();
  }

  async loginWithGoogle({ googleId, email, name, avatarUrl, role }) {
    if (!googleId) throw new ApiError(400, 'googleId is required');

    const now = new Date();
    const existing = await this.repo.findByGoogleId(googleId);

    if (existing) {
      const updated = await this.repo.updateById(existing._id, {
        email,
        name,
        avatarUrl,
        role,
        lastLoginAt: now
      });
      return updated.toPublic();
    }

    const created = await this.repo.create({
      googleId,
      email,
      name,
      avatarUrl,
      role,
      lastLoginAt: now
    });

    return created.toPublic();
  }

  issueTokens(userPublic) {
    const payload = { sub: userPublic.id, role: userPublic.role, email: userPublic.email };
    const accessToken = signToken(payload, { expiresIn: TOKEN_EXP });
    const refreshToken = signRefreshToken(payload, { expiresIn: REFRESH_EXP });
    return { accessToken, refreshToken, expiresIn: TOKEN_EXP, refreshExpiresIn: REFRESH_EXP };
  }

  async refreshTokens(refreshToken) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (err) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const user = await this.repo.findById(payload.sub);
    if (!user) throw new ApiError(401, 'User not found');
    const userPublic = user.toPublic();
    const tokens = this.issueTokens(userPublic);
    return { user: userPublic, tokens };
  }
}
