import { Router } from 'express';
import { createUser, getUser, listUsers, updateUser, deleteUser, getCurrentUser } from '../controllers/user.controller.js';

const r = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 사용자 관리
 */
/**
 * @swagger
 * /users:
 *   post:
 *     summary: 사용자 생성(테스트용)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               kakaoId: { type: string }
 *               email: { type: string }
 *               name: { type: string }
 *               avatarUrl: { type: string }
 *               role: { type: string, enum: ['user','admin'] }
 *     responses:
 *       201: { description: 생성된 사용자 }
 *   get:
 *     summary: 사용자 목록
 *     tags: [Users]
 *     responses:
 *       200: { description: 사용자 목록 }
 */
r.post('/', createUser);
r.get('/', listUsers);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: 현재 사용자 정보
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 현재 사용자 }
 */
r.get('/me', getCurrentUser);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: 사용자 단건 조회
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *   patch:
 *     summary: 사용자 수정
 *     tags: [Users]
 *   delete:
 *     summary: 사용자 삭제
 *     tags: [Users]
 */
r.get('/:id', getUser);
r.patch('/:id', updateUser);
r.delete('/:id', deleteUser);

export default r;
