import { Router } from 'express';
import {
  createVersion,
  getVersion,
  listVersions,
  listVersionHistory,
  updateVersion,
  addVersionApproval,
  setVersionStatus
} from '../controllers/version.controller.js';
import validate from '../middlewares/validate.js';
import validateObjectId from '../middlewares/validateObjectId.js';

const r = Router();

/**
 * @swagger
 * tags:
 *   name: Versions
 *   description: 버전(커밋) 관리
 */
/**
 * @swagger
 * /versions:
 *   post:
 *     summary: 버전 생성
 *     tags: [Versions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId, commitId, authorId]
 *             properties:
 *               projectId:
 *                 type: string
 *                 format: objectId
 *                 example: 507f1f77bcf86cd799439011
 *               fileId:
 *                 type: string
 *                 format: objectId
 *                 example: 507f1f77bcf86cd799439012
 *               commitId: { type: string }
 *               branch: { type: string }
 *               message: { type: string }
 *               authorId:
 *                 type: string
 *                 format: objectId
 *                 example: 507f1f77bcf86cd799439013
 *     responses:
 *       201: { description: 생성된 버전 }
 *   get:
 *     summary: 버전 목록
 *     tags: [Versions]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 버전 목록 }
 * /versions/history:
 *   get:
 *     summary: 버전 기록(승인 단계 포함) 조회
 *     tags: [Versions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string, format: objectId }
 *       - in: query
 *         name: fileId
 *         schema: { type: string, format: objectId }
 *       - in: query
 *         name: branch
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: 버전 기록 목록 (author, approvals 포함) }
 */
r.post(
  '/',
  validate(['projectId', 'commitId', 'authorId']),
  validateObjectId(['projectId', 'authorId', 'fileId']),
  createVersion
);
r.get('/', listVersions);
r.get('/history', listVersionHistory);
r.get('/:id', validateObjectId(['id']), getVersion);
r.patch('/:id', validateObjectId(['id']), updateVersion);

/**
 * @swagger
 * /versions/{id}/approvals:
 *   post:
 *     summary: 버전 승인/거절 기록 추가
 *     tags: [Versions]
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
 *             required: [userId, decision]
 *             properties:
 *               userId:
 *                 type: string
 *                 format: objectId
 *                 example: 507f1f77bcf86cd799439014
 *               decision: { type: string, enum: ['approve','reject'] }
 *               comment: { type: string }
 *     responses:
 *       200: { description: 업데이트된 버전 }
 */
r.post(
  '/:id/approvals',
  validate(['userId', 'decision']),
  validateObjectId(['id', 'userId']),
  addVersionApproval
);

/**
 * @swagger
 * /versions/{id}/status:
 *   post:
 *     summary: 버전 상태 변경
 *     tags: [Versions]
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
 *             required: [status]
 *             properties:
 *               status: { type: string }
 *     responses:
 *       200: { description: 업데이트된 버전 }
 */
r.post('/:id/status', validate(['status']), validateObjectId(['id']), setVersionStatus);

export default r;
