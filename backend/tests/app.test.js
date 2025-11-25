import request from 'supertest';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import router from '../src/routes/index.js';
import notFound from '../src/middlewares/notFound.js';
import errorHandler from '../src/middlewares/errorHandler.js';
import { connectDB } from '../src/db/index.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || 'dummy-client';
process.env.KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI || 'http://localhost/callback';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/versionflow_test';

function createApp() {
  const app = express();
  app.use(helmet());
  app.use(express.json({ limit: '3mb' }));
  app.use(morgan('dev'));
  app.use(cookieParser());
  app.get('/health', (req, res) => res.json({ ok: true }));
  app.use('/api', router);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

const app = createApp();

beforeAll(async () => {
  await connectDB();
  await mongoose.connection.db.dropDatabase();
  const fixtureDir = path.join(process.cwd(), 'tests', 'fixtures');
  fs.mkdirSync(fixtureDir, { recursive: true });
  fs.writeFileSync(path.join(fixtureDir, 'sample.txt'), 'hello upload');
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('E2E API (cookie-based auth)', () => {
  const ids = {
    ownerId: new mongoose.Types.ObjectId().toString(),
    authorId: new mongoose.Types.ObjectId().toString(),
    initiatorId: new mongoose.Types.ObjectId().toString()
  };
  let accessToken;
  let refreshToken;
  let projectId;
  let fileId;
  let versionId;
  let invitationId;
  const uploadPath = path.join(process.cwd(), 'tests', 'fixtures', 'sample.txt');

  const cookieHeader = () => [
    `accessToken=${accessToken}`,
    refreshToken ? `refreshToken=${refreshToken}` : null
  ].filter(Boolean);

  test('GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('POST /api/auth/kakao 로그인 및 토큰 발급', async () => {
    const res = await request(app).post('/api/auth/kakao').send({
      kakaoId: 'kakao-e2e-1',
      email: 'user1@example.com',
      name: 'User One',
      avatarUrl: 'http://avatar/1.png',
      role: 'user'
    });
    expect(res.status).toBe(200);
    expect(res.body.data.user.kakaoId).toBe('kakao-e2e-1');
    accessToken = res.body.data.tokens.accessToken;
    refreshToken = res.body.data.tokens.refreshToken;
  });

  test('토큰 없이 보호 라우트 접근 시 401', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(401);
  });

  test('POST /api/projects 프로젝트 생성', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Cookie', cookieHeader())
      .send({ name: 'Project One', ownerId: ids.ownerId, description: 'E2E project' });
    expect(res.status).toBe(201);
    projectId = res.body.data._id || res.body.data.id;
    expect(projectId).toBeDefined();
  });

  test('POST /api/projects/:projectId/files 파일 추가', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/files`)
      .set('Cookie', cookieHeader())
      .send({ projectId, path: '/docs/readme.md' });
    expect(res.status).toBe(201);
    fileId = res.body.data._id || res.body.data.id;
    expect(fileId).toBeDefined();
  });

  test('POST /api/versions 버전(커밋) 생성', async () => {
    const res = await request(app)
      .post('/api/versions')
      .set('Cookie', cookieHeader())
      .send({
        projectId,
        fileId,
        commitId: 'commit-123',
        parentCommitIds: [],
        branch: 'main',
        message: 'init commit',
        authorId: ids.authorId
      });
    expect(res.status).toBe(201);
    versionId = res.body.data._id || res.body.data.id;
    expect(versionId).toBeDefined();
  });

  test('POST /api/versions/:id/approvals 승인 추가', async () => {
    const res = await request(app)
      .post(`/api/versions/${versionId}/approvals`)
      .set('Cookie', cookieHeader())
      .send({ userId: ids.ownerId, decision: 'approve', comment: 'LGTM' });
    expect(res.status).toBe(200);
    expect(res.body.data.review.approvals.length).toBe(1);
  });

  test('POST /api/versions/:id/status 상태 변경', async () => {
    const res = await request(app)
      .post(`/api/versions/${versionId}/status`)
      .set('Cookie', cookieHeader())
      .send({ status: 'approved' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('approved');
  });

  test('POST /api/invitations 초대 생성', async () => {
    const res = await request(app)
      .post('/api/invitations')
      .set('Cookie', cookieHeader())
      .send({
        projectId,
        inviterId: ids.ownerId,
        inviteeEmail: 'invitee@example.com'
      });
    expect(res.status).toBe(201);
    invitationId = res.body.data._id || res.body.data.id;
    expect(invitationId).toBeDefined();
  });

  test('POST /api/invitations/:id/respond 초대 응답', async () => {
    const res = await request(app)
      .post(`/api/invitations/${invitationId}/respond`)
      .set('Cookie', cookieHeader())
      .send({ decision: 'accepted' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('accepted');
  });

  test('POST /api/rollbacks 롤백 기록 생성', async () => {
    const res = await request(app)
      .post('/api/rollbacks')
      .set('Cookie', cookieHeader())
      .send({
        projectId,
        targetCommitId: 'commit-123',
        initiatorId: ids.initiatorId,
        note: 'rollback test'
      });
    expect(res.status).toBe(201);
    expect(res.body.data.targetCommitId).toBe('commit-123');
  });

  test('POST /api/projects/:projectId/previews 미리보기 생성', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/previews`)
      .set('Cookie', cookieHeader())
      .send({
        projectId,
        fileId,
        versionId,
        previewUrl: 'http://preview/url'
      });
    expect(res.status).toBe(201);
    expect(res.body.data.previewUrl).toBe('http://preview/url');
  });

  test('POST /api/projects/:projectId/upload 파일 업로드 및 커밋', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/upload`)
      .set('Cookie', cookieHeader())
      .field('authorId', ids.authorId)
      .field('message', 'upload commit')
      .field('folderPath', '/uploads')
      .attach('file', uploadPath);
    expect(res.status).toBe(201);
    expect(res.body.data.file).toBeDefined();
    expect(res.body.data.version).toBeDefined();
    expect(res.body.data.version.message).toBe('upload commit');
  });
});
