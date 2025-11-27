import { Router } from 'express';
import {
  createProject,
  getProject,
  listProjects,
  listProjectsByUserId,
  listProjectFolders,
  updateProject,
  updateProjectVersioning,
  deleteProject,
  leaveProject,
  addProjectMember,
  removeProjectMember,
  updateProjectMemberRole
} from '../controllers/project.controller.js';
import validate from '../middlewares/validate.js';
import { uploadFileAndCommit } from '../controllers/upload.controller.js';
import { uploadSingle } from '../middlewares/upload.js';
import { listMyProjects } from '../controllers/project.controller.js';

const r = Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: 프로젝트 및 멤버 관리
 */
/**
 * @swagger
 * /projects:
 *   post:
 *     summary: 프로젝트 생성
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, ownerId]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               ownerId:
 *                 type: string
 *                 format: objectId
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       201: { description: 생성된 프로젝트 }
 *   get:
 *     summary: 프로젝트 목록
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: includeTree
 *         schema: { type: boolean }
 *         description: true일 경우 children(폴더/파일 트리) 포함
 *     responses:
 *       200: { description: 프로젝트 페이지 }
 */
r.post('/', validate(['name', 'ownerId']), createProject);
r.get('/me', listMyProjects);
r.get('/user/:userId', listProjectsByUserId);
r.get('/:projectId/folders', listProjectFolders);
r.get('/', listProjects);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: 프로젝트 단건 조회
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *   patch:
 *     summary: 프로젝트 수정
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *   delete:
 *     summary: 프로젝트 삭제 (owner만)
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 삭제 완료 }
 */
r.get('/:id', getProject);
r.patch('/:id', updateProject);
r.delete('/:id', deleteProject);
/**
 * @swagger
 * /projects/{id}:/settings/versioning:
 *   patch:
 *     summary: 프로젝트 버전 관리 설정 수정
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               namingScheme:
 *                 type: string
 *                 description: 버전 네이밍 규칙
 *                 enum:
 *                   - date-major      # {year}.{month}.{version} 예: 2024.10.1
 *                   - major-minor     # v{major}.{minor} 예: v1.0
 *                   - semver          # v{major}.{minor}.{patch} 예: v1.0.0
 *               reviewRequired:
 *                 type: boolean
 *                 description: 모든 커밋 승인 필요 여부
 *               minApprovals:
 *                 type: integer
 *                 description: 승인 최소 인원
 *     responses:
 *       200: { description: 업데이트된 프로젝트 }
 */
r.patch('/:id/settings/versioning', updateProjectVersioning);
/**
 * @swagger
 * /projects/{id}/leave:
 *   delete:
 *     summary: 프로젝트 나가기 (owner 제외)
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 나가기 완료 }
 */
r.delete('/:id/leave', leaveProject);

/**
 * @swagger
 * /projects/{id}/members:
 *   post:
 *     summary: 멤버 추가
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, role]
 *             properties:
 *               userId: { type: string }
 *               role: { type: string, enum: ['owner','maintainer','member'] }
 *     responses:
 *       200: { description: 업데이트된 프로젝트 }
 */
r.post('/:id/members', validate(['userId', 'role']), addProjectMember);

/**
 * @swagger
 * /projects/{id}/members/{userId}:
 *   patch:
 *     summary: 멤버 역할 변경
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: ['owner','maintainer','member'] }
 *     responses:
 *       200: { description: 업데이트된 프로젝트 }
 *   delete:
 *     summary: 멤버 제거
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *           example: 507f1f77bcf86cd799439011
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 업데이트된 프로젝트 }
 */
r.patch('/:id/members/:userId', validate(['role']), updateProjectMemberRole);
r.delete('/:id/members/:userId', removeProjectMember);

/**
 * @swagger
 * /projects/{projectId}/upload:
 *   post:
 *     summary: 파일 업로드 및 커밋 생성
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file, authorId, message]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               authorId:
 *                 type: string
 *                 format: objectId
 *                 example: 507f1f77bcf86cd799439011
 *               authorName:
 *                 type: string
 *               authorEmail:
 *                 type: string
 *               message:
 *                 type: string
 *               branch:
 *                 type: string
 *               folderPath:
 *                 type: string
 *     responses:
 *       201: { description: 파일/버전/커밋 정보 }
 */
r.post(
  '/:projectId/upload',
  uploadSingle,
  validate(['authorId', 'message']),
  uploadFileAndCommit
);

export default r;
