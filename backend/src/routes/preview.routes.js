import { Router } from 'express';
import {
  createPreview,
  getPreview,
  listPreviewsByProject,
  findPreviewByVersion,
  findLatestPreviewForFile,
  deletePreview
} from '../controllers/preview.controller.js';
import validate from '../middlewares/validate.js';

const r = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Previews
 *   description: 미리보기 관리
 */
/**
 * @swagger
 * /projects/{projectId}/previews:
 *   post:
 *     summary: 미리보기 생성
 *     tags: [Previews]
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
 *             required: [projectId, versionId]
 *             properties:
 *               projectId:
 *                 type: string
 *                 format: objectId
 *                 example: 507f1f77bcf86cd799439011
 *               fileId:
 *                 type: string
 *                 format: objectId
 *                 example: 507f1f77bcf86cd799439012
 *               versionId:
 *                 type: string
 *                 format: objectId
 *                 example: 507f1f77bcf86cd799439013
 *               previewUrl: { type: string }
 *     responses:
 *       201: { description: 생성된 미리보기 }
 *   get:
 *     summary: 프로젝트별 미리보기 목록
 *     tags: [Previews]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 미리보기 목록 }
 */
r.post('/', validate(['projectId', 'versionId']), createPreview);
r.get('/', listPreviewsByProject); // expects projectId from parent route param
r.get('/version/:versionId', findPreviewByVersion);
r.get('/file/:fileId/latest', findLatestPreviewForFile);
r.get('/:id', getPreview);
r.delete('/:id', deletePreview);

export default r;
