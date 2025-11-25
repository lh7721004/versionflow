import fs from 'fs';
import path from 'path';
import { loadEnv } from '../src/config/env.js';
import { connectDB } from '../src/db/index.js';
import { UserModel } from '../src/entities/User.js';
import { ProjectModel } from '../src/entities/Project.js';
import { ProjectMemberModel } from '../src/entities/ProjectMember.js';
import { FileModel } from '../src/entities/File.js';
import { VersionModel } from '../src/entities/Version.js';
import { InvitationModel } from '../src/entities/Invitation.js';
import { PreviewModel } from '../src/entities/Preview.js';
import { RollbackModel } from '../src/entities/Rollback.js';
import { GitService } from '../src/services/git.service.js';

loadEnv();

async function main() {
  await connectDB();
  const git = new GitService();

  // 1) 기본 유저
  const users = [
    { email: 'owner@example.com', name: '오너', role: 'admin' },
    { email: 'member1@example.com', name: '멤버1', role: 'user' },
    { email: 'member2@example.com', name: '멤버2', role: 'user' },
    { email: 'guest@example.com', name: '게스트', role: 'user' }
  ];
  const userDocs = {};
  for (const u of users) {
    const existing = await UserModel.findOne({ email: u.email });
    if (existing) {
      userDocs[u.email] = existing;
      continue;
    }
    const created = await UserModel.create({
      ...u,
      kakaoId: u.email,
      googleId: u.email,
      lastLoginAt: new Date()
    });
    userDocs[u.email] = created;
  }

  // 2) 프로젝트 생성
  const projects = [
    {
      name: 'Demo Project A',
      description: '테스트용 프로젝트 A',
      ownerEmail: 'owner@example.com',
      members: [
        { email: 'member1@example.com', role: 'maintainer' },
        { email: 'member2@example.com', role: 'member' }
      ]
    },
    {
      name: 'Demo Project B',
      description: '테스트용 프로젝트 B',
      ownerEmail: 'member1@example.com',
      members: [
        { email: 'owner@example.com', role: 'maintainer' },
        { email: 'member2@example.com', role: 'member' }
      ]
    }
  ];

  const projectDocs = [];

  for (const p of projects) {
    const owner = userDocs[p.ownerEmail];
    const members = p.members
      .map((m) => {
        const user = userDocs[m.email];
        if (!user) return null;
        return { userId: user._id, role: m.role, joinedAt: new Date() };
      })
      .filter(Boolean);

    let project = await ProjectModel.findOne({ name: p.name });
    if (!project) {
      project = await ProjectModel.create({
        name: p.name,
        description: p.description,
        ownerId: owner._id,
        members,
        status: 'active'
      });
    } else {
      project.ownerId = owner._id;
      project.members = members;
      await project.save();
    }

    // 멤버십 테이블 동기화
    await ProjectMemberModel.deleteMany({ projectId: project._id });
    const membershipDocs = members.map((m) => ({
      projectId: project._id,
      userId: m.userId,
      role: m.role,
      joinedAt: m.joinedAt
    }));
    if (membershipDocs.length) {
      await ProjectMemberModel.insertMany(membershipDocs);
    }

    // simple-git 저장소 준비
    const repoPath = await git.ensureRepo(project._id.toString());
    if (!project.repoPath) {
      project.repoPath = repoPath;
      await project.save();
    }

    projectDocs.push(project);
  }

  // 3) 파일/버전/프리뷰/롤백 더미 생성
  for (const project of projectDocs) {
    // 파일 2개 생성
    const fileMetas = [
      { path: 'docs/readme.md', content: `# ${project.name}\n\nseeded content` },
      { path: 'src/index.txt', content: `hello ${project.name}` }
    ];

    for (const meta of fileMetas) {
      // 업로드 파일 생성
      const tempPath = path.join(process.cwd(), 'uploads', project._id.toString());
      fs.mkdirSync(tempPath, { recursive: true });
      const absFile = path.join(tempPath, meta.path.replace(/\//g, '_'));
      fs.writeFileSync(absFile, meta.content);

      // git commit
      const author = userDocs['owner@example.com'];
      const { commitId } = await git.addAndCommit(
        project._id.toString(),
        absFile,
        meta.path,
        `seed: add ${meta.path}`,
        { name: author?.name, email: author?.email }
      );

      // 파일/버전 문서 생성
      let fileDoc = await FileModel.findOne({ projectId: project._id, path: meta.path });
      if (!fileDoc) {
        fileDoc = await FileModel.create({ projectId: project._id, path: meta.path });
      }

      const version = await VersionModel.create({
        projectId: project._id,
        fileId: fileDoc._id,
        commitId,
        parentCommitIds: [],
        branch: 'main',
        message: `seed: add ${meta.path}`,
        authorId: author?._id,
        status: 'approved',
        review: {
          requiredApprovals: 1,
          approvals: [{
            userId: author?._id,
            decision: 'approve',
            comment: 'auto-approved',
            at: new Date()
          }]
        },
        artifacts: {
          storageKey: path.join(git.getRepoPath(project._id.toString()), meta.path),
          previewUrl: absFile
        }
      });

      await FileModel.findByIdAndUpdate(fileDoc._id, { latestVersionId: version._id });

      // 프리뷰 생성
      await PreviewModel.create({
        projectId: project._id,
        fileId: fileDoc._id,
        versionId: version._id,
        previewUrl: `http://localhost:4000/preview/${version._id}`,
        generatedAt: new Date()
      });

      // 롤백 기록 (샘플)
      await RollbackModel.create({
        projectId: project._id,
        targetCommitId: commitId,
        initiatorId: author?._id,
        status: 'completed',
        note: 'seed rollback record',
        completedAt: new Date()
      });
    }
  }

  // 4) 초대 더미
  const sampleProject = projectDocs[0];
  if (sampleProject) {
    const inviter = userDocs['owner@example.com'];
    const invitee = userDocs['guest@example.com'];
    await InvitationModel.deleteMany({ projectId: sampleProject._id, inviteeId: invitee._id });
    await InvitationModel.create({
      projectId: sampleProject._id,
      inviterId: inviter?._id,
      inviteeId: invitee?._id,
      inviteeEmail: invitee?.email,
      token: `seed-token-${Date.now()}`,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
  }

  console.log('Dummy data seeding completed.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
