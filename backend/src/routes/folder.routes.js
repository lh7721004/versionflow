import { Router } from 'express';
import { createFolder, listFolders, deleteFolder } from '../controllers/folder.controller.js';
import validate from '../middlewares/validate.js';
import validateObjectId from '../middlewares/validateObjectId.js';

const r = Router();

/**
 * @swagger
 * tags:
 *   name: Folders
 *   description: 프로젝트 폴더 관리
 */
/**
 * @swagger
 * /folders:
 *   post:
 *     summary: 폴더 생성
 *     tags: [Folders]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId, name]
 *             properties:
 *               projectId:
 *                 type: string
 *                 format: objectId
 *               parentFolderId:
 *                 type: string
 *                 format: objectId
 *               name: { type: string }
 *     responses:
 *       201: { description: 생성된 폴더 }
 *   get:
 *     summary: 프로젝트의 폴더 목록
 *     tags: [Folders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: objectId }
 *     responses:
 *       200: { description: 폴더 목록 }
 * /folders/{id}:
 *   delete:
 *     summary: 폴더 삭제
 *     tags: [Folders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: objectId }
 *     responses:
 *       200: { description: 삭제 완료 }
 */
r.post('/', validate(['projectId', 'name']), createFolder);
r.get('/', listFolders);
r.delete('/:id', validateObjectId(['id']), deleteFolder);

export default r;
