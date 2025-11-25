import { Router } from 'express';
import {
  createInvitation,
  getInvitation,
  listInvitations,
  respondInvitation,
  expireInvitation
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
 *     summary: 초대 생성
 *     tags: [Invitations]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId, inviterId]
 *             properties:
 *               projectId:
 *                 type: string
 *                 format: objectId
 *                 example: 507f1f77bcf86cd799439011
 *               inviterId:
 *                 type: string
 *                 format: objectId
 *                 example: 507f1f77bcf86cd799439012
 *               inviteeId:
 *                 type: string
 *                 format: objectId
 *                 example: 507f1f77bcf86cd799439013
 *               inviteeEmail: { type: string }
 *     responses:
 *       201: { description: 생성된 초대 }
 *   get:
 *     summary: 초대 목록
 *     tags: [Invitations]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 초대 목록 }
 */
r.post('/', validate(['projectId', 'inviterId']), validateObjectId(['projectId', 'inviterId', 'inviteeId']), createInvitation);
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
 *           example: 507f1f77bcf86cd799439011
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

export default r;
