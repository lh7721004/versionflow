import { Router } from 'express';
import { kakaoLogin, kakaoCallback, refreshAccessToken, googleCallback } from '../controllers/oauth.controller.js';
import validate from '../middlewares/validate.js';

const r = Router();

/**
 * @swagger
 * /auth/kakao:
 *   post:
 *     summary: Kakao 프로필 기반 로그인(테스트용)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [kakaoId]
 *             properties:
 *               kakaoId: { type: string }
 *               email: { type: string }
 *               name: { type: string }
 *               avatarUrl: { type: string }
 *     responses:
 *       200:
 *         description: 사용자와 토큰 반환
 */
r.post('/kakao', validate(['kakaoId']), kakaoLogin);

/**
 * @swagger
 * /auth/kakao/callback:
 *   get:
 *     summary: Kakao OAuth code 교환 로그인
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 사용자와 토큰 반환
 */
r.get('/kakao/callback', kakaoCallback);
r.get('/google/callback', googleCallback);
r.post('/refresh', refreshAccessToken);

export default r;
