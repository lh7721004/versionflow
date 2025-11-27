import { Router } from 'express';
import userRoutes from './user.routes.js';
import projectRoutes from './project.routes.js';
import fileRoutes from './file.routes.js';
import folderRoutes from './folder.routes.js';
import invitationRoutes from './invitation.routes.js';
import versionRoutes from './version.routes.js';
import rollbackRoutes from './rollback.routes.js';
import previewRoutes from './preview.routes.js';
import oauthRoutes from './oauth.routes.js';
import requireAuth from '../middlewares/auth.js';
import swaggerRoutes from './swagger.js';

const router = Router();

router.use('/docs', swaggerRoutes);
router.use('/auth', oauthRoutes);

// SKIP_AUTH=true이면 인증 미들웨어를 건너뛴다. (런타임 시점 체크)
router.use((req, res, next) => {
  if (process.env.SKIP_AUTH === 'true') return next();
  return requireAuth(req, res, next);
});
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/folders', folderRoutes);
router.use('/projects/:projectId/files', fileRoutes);
router.use('/projects/:projectId/previews', previewRoutes);
router.use('/invitations', invitationRoutes);
router.use('/versions', versionRoutes);
router.use('/rollbacks', rollbackRoutes);

export default router;
