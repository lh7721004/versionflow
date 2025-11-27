import { Router } from 'express';
import {
  createInvitation,
  getInvitation,
  listInvitations,
  respondInvitation,
  expireInvitation,
  acceptInvitationByToken
} from '../controllers/invitation.controller.js';
import validate from '../middlewares/validate.js';
import validateObjectId from '../middlewares/validateObjectId.js';

const r = Router();

/**
 * @swagger
 * tags:
 *   name: Invitations
 *   description: 프로젝트 초대 관리
 */
/**
 * @swagger
 * /invitations:
 *   post:
 *     summary: 초대 생성 (이메일 + 역할 지정)
 *     tags: [Invitations]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId, inviterId, inviteeEmail, role]
 *             properties:
 *               projectId:
 *                 type: string
 *                 format: objectId
 *               inviterId:
 *                 type: string
 *                 format: objectId
 *               inviteeEmail:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: ['owner','maintainer','member']
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201: { description: 생성된 초대 }
 *   get:
 *     summary: 초대 목록
 *     tags: [Invitations]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 초대 목록 }
 */
r.post(
  '/',
  validate(['projectId', 'inviterId', 'inviteeEmail', 'role']),
  validateObjectId(['projectId', 'inviterId']),
  createInvitation
);
r.get('/', listInvitations);
r.get('/:id', validateObjectId(['id']), getInvitation);

/**
 * @swagger
 * /invitations/{id}/respond:
 *   post:
 *     summary: 초대 수락/거절
 *     tags: [Invitations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [decision]
 *             properties:
 *               decision: { type: string, enum: ['accepted','declined'] }
 *     responses:
 *       200: { description: 업데이트된 초대 }
 */
r.post('/:id/respond', validate(['decision']), validateObjectId(['id']), respondInvitation);
r.post('/:id/expire', expireInvitation);

/**
 * @swagger
 * /invitations/accept/token:
 *   post:
 *     summary: 초대 토큰으로 수락 및 멤버 추가
 *     tags: [Invitations]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, userId]
 *             properties:
 *               token: { type: string }
 *               userId:
 *                 type: string
 *                 format: objectId
 *     responses:
 *       200: { description: 초대 수락 및 멤버 추가 완료 }
 */
r.post('/accept/token', validate(['token', 'userId']), acceptInvitationByToken);

export default r;
