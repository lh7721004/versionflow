import fs from 'fs';
import path from 'path';
import { loadEnv } from '../src/config/env.js';
import { connectDB } from '../src/db/index.js';
import { UserModel } from '../src/entities/User.js';
import { ProjectModel } from '../src/entities/Project.js';
import { ProjectMemberModel } from '../src/entities/ProjectMember.js';
import { FolderModel } from '../src/entities/Folder.js';
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

  const users = [
    { email: 'owner@example.com', name: '오너', role: 'admin' },
    { email: 'member1@example.com', name: '멤버1', role: 'user' },
    { email: 'member2@example.com', name: '멤버2', role: 'user' },
    { email: 'guest@example.com', name: '게스트', role: 'user' },
    {
      email: 'lh7721004@gmail.com',
      name: '김이현',
      role: 'user',
      avatarUrl: 'https://lh3.googleusercontent.com/a/ACg8ocIgbm4L8llgw7U4Y1iKqzrOvByVbeX7LZekAlHggDN-G_H3n2U=s96-c',
      googleId: '110373783009894644519'
    },
    {
      email: 'lh7721004@naver.com',
      name: '김이현',
      role: 'user',
      avatarUrl: 'http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg',
      kakaoId: '4595787514'
    }
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
      kakaoId: u.kakaoId || u.email,
      googleId: u.googleId || u.email,
      lastLoginAt: new Date()
    });
    userDocs[u.email] = created;
  }
  const kakaoUser = await UserModel.findOne({ kakaoId: '4595787514' });
  if (kakaoUser) userDocs['kakao-4595787514'] = kakaoUser;

  const projects = [
    {
      name: 'Demo Project A',
      description: '테스트용 프로젝트 A',
      ownerEmail: 'owner@example.com',
      members: [
        { email: 'member1@example.com', role: 'maintainer' },
        { email: 'member2@example.com', role: 'member' },
        { email: 'lh7721004@gmail.com', role: 'member' },
        { email: 'lh7721004@naver.com', role: 'member' }
      ]
    },
    {
      name: 'Demo Project B',
      description: '테스트용 프로젝트 B',
      ownerEmail: 'member1@example.com',
      members: [
        { email: 'owner@example.com', role: 'maintainer' },
        { email: 'member2@example.com', role: 'member' },
        { email: 'lh7721004@gmail.com', role: 'member' },
        { email: 'lh7721004@naver.com', role: 'member' }
      ]
    }
  ];

  const projectDocs = [];

  for (const p of projects) {
    const owner = userDocs[p.ownerEmail];
    const members = p.members
      .map((m) => {
        const user = userDocs[m.email] || (m.email === 'lh7721004@naver.com' ? userDocs['kakao-4595787514'] : null);
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

    const repoPath = await git.ensureRepo(project._id.toString());
    if (!project.repoPath) {
      project.repoPath = repoPath;
      await project.save();
    }

    projectDocs.push(project);
  }

  // 폴더/파일/버전 더미
  for (const project of projectDocs) {
    const folderPaths = ['docs', 'docs/requirements', 'src'];
    const folderMap = {};
    for (const fp of folderPaths) {
      const parts = fp.split('/').filter(Boolean);
      let currentPath = '';
      let parentId = null;
      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        let folder = await FolderModel.findOne({ projectId: project._id, path: currentPath });
        if (!folder) {
          folder = await FolderModel.create({
            projectId: project._id,
            parentFolderId: parentId,
            name: part,
            path: currentPath
          });
        }
        parentId = folder._id;
        folderMap[currentPath] = folder;
      }
    }

    const fileMetas = [
      { path: 'docs/readme.md', content: `# ${project.name}\n\nseeded content` },
      { path: 'docs/requirements/spec.md', content: `Requirements for ${project.name}` },
      { path: 'src/index.txt', content: `hello ${project.name}` }
    ];

    for (const meta of fileMetas) {
      const tempPath = path.join(process.cwd(), 'uploads', project._id.toString());
      fs.mkdirSync(tempPath, { recursive: true });
      const absFile = path.join(tempPath, meta.path.replace(/\//g, '_'));
      fs.writeFileSync(absFile, meta.content);

      const author = userDocs['owner@example.com'];
      try {
        const { commitId } = await git.addAndCommit(
          project._id.toString(),
          absFile,
          meta.path,
          `seed: add ${meta.path}`,
          { name: author?.name, email: author?.email }
        );

        let fileDoc = await FileModel.findOne({ projectId: project._id, path: meta.path });
        if (!fileDoc) {
          const folderPath = meta.path.includes('/') ? meta.path.split('/').slice(0, -1).join('/') : '';
          const folder = folderPath ? folderMap[folderPath] : null;
          fileDoc = await FileModel.create({ projectId: project._id, path: meta.path, folderId: folder?._id });
          if (folder) {
            folder.files = folder.files || [];
            folder.files.push(fileDoc._id);
            await folder.save();
          }
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

        await PreviewModel.create({
          projectId: project._id,
          fileId: fileDoc._id,
          versionId: version._id,
          previewUrl: `http://localhost:4000/preview/${version._id}`,
          generatedAt: new Date()
        });

        await RollbackModel.create({
          projectId: project._id,
          targetCommitId: commitId,
          initiatorId: author?._id,
          status: 'completed',
          note: 'seed rollback record',
          completedAt: new Date()
        });
      } catch (e) {
        console.error('seed file/commit error', e);
      }
    }
  }

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
