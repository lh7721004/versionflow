import { Router } from 'express';
import {
  createRollback,
  getRollback,
  listRollbacks,
  updateRollback,
  deleteRollback,
  executeRollback
} from '../controllers/rollback.controller.js';
import validate from '../middlewares/validate.js';

const r = Router();

/**
 * @swagger
 * tags:
 *   name: Rollbacks
 *   description: 커밋 롤백 기록/실행
 */
/**
 * @swagger
 * /rollbacks:
 *   post:
 *     summary: 롤백 기록 생성
 *     tags: [Rollbacks]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId, targetCommitId, initiatorId]
 *             properties:
 *               projectId:
 *                 type: string
 *                 format: objectId
 *                 example: 507f1f77bcf86cd799439011
 *               targetCommitId: { type: string }
 *               initiatorId:
 *                 type: string
 *                 format: objectId
 *                 example: 507f1f77bcf86cd799439012
 *               note: { type: string }
 *     responses:
 *       201: { description: 생성된 롤백 기록 }
 *   get:
 *     summary: 롤백 목록
 *     tags: [Rollbacks]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 롤백 목록 }
 */
r.post('/', validate(['projectId', 'targetCommitId', 'initiatorId']), createRollback);
r.get('/', listRollbacks);
r.get('/:id', getRollback);
r.patch('/:id', updateRollback);
r.delete('/:id', deleteRollback);

/**
 * @swagger
 * /rollbacks/execute:
 *   post:
 *     summary: 특정 커밋으로 롤백 실행
 *     tags: [Rollbacks]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId, targetCommitId, initiatorId]
 *             properties:
 *               projectId:
 *                 type: string
 *                 format: objectId
 *                 example: 507f1f77bcf86cd799439011
 *               targetCommitId: { type: string }
 *               initiatorId:
 *                 type: string
 *                 format: objectId
 *                 example: 507f1f77bcf86cd799439012
 *               note: { type: string }
 *     responses:
 *       201: { description: 롤백 실행 결과 }
 */
r.post('/execute', validate(['projectId', 'targetCommitId', 'initiatorId']), executeRollback);

export default r;
