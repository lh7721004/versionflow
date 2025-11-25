import { Router } from 'express';
import {
  createFile,
  getFile,
  listFilesByProject,
  updateFile,
  deleteFile
} from '../controllers/file.controller.js';
import validate from '../middlewares/validate.js';
import validateObjectId from '../middlewares/validateObjectId.js';

const r = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: 파일 메타 관리
 */
/**
 * @swagger
 * /projects/{projectId}/files:
 *   post:
 *     summary: 파일 메타 생성
 *     tags: [Files]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId, path]
 *             properties:
 *               projectId:
 *                 type: string
 *                 format: objectId
 *                 example: 507f1f77bcf86cd799439011
 *               path: { type: string }
 *     responses:
 *       201: { description: 생성된 파일 메타 }
 *   get:
 *     summary: 프로젝트 내 파일 목록
 *     tags: [Files]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *           example: 507f1f77bcf86cd799439011
 *     responses:
 *       200: { description: 파일 목록 }
 */
r.post('/', validate(['projectId', 'path']), validateObjectId(['projectId']), createFile);
r.get('/', listFilesByProject); // expects projectId from parent route param
r.get('/:id', validateObjectId(['id']), getFile);
r.patch('/:id', validateObjectId(['id']), updateFile);
r.delete('/:id', validateObjectId(['id']), deleteFile);

export default r;
