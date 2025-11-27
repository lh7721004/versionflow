import fs from 'fs';
import path from 'path';
import { FileRepository } from '../repositories/file.repository.js';
import { VersionRepository } from '../repositories/version.repository.js';
import ApiError from '../utils/ApiError.js';
import { GitService } from './git.service.js';
import { ProjectRepository } from '../repositories/project.repository.js';
import { FolderRepository } from '../repositories/folder.repository.js';

export class UploadService {
  constructor(
    fileRepo = new FileRepository(),
    versionRepo = new VersionRepository(),
    git = new GitService(),
    projectRepo = new ProjectRepository(),
    folderRepo = new FolderRepository()
  ) {
    this.fileRepo = fileRepo;
    this.versionRepo = versionRepo;
    this.git = git;
    this.projectRepo = projectRepo;
    this.folderRepo = folderRepo;
  }

  async uploadAndCommit({
    projectId,
    folderPath = '/',
    fileMeta,
    authorId,
    branch = 'main',
    message,
    authorProfile
  }) {
    if (!projectId) throw new ApiError(400, 'projectId is required');
    if (!authorId) throw new ApiError(400, 'authorId is required');
    if (!fileMeta?.path || !fileMeta?.filename) throw new ApiError(400, 'file metadata missing');
    if (!message) throw new ApiError(400, 'commit message is required');

    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new ApiError(404, 'Project not found');

    const normalizedFolder = folderPath.endsWith('/') ? folderPath.slice(0, -1) : folderPath;
    const relativePath = `${normalizedFolder || ''}/${fileMeta.filename}`.replace(/\/+/g, '/').replace(/^\//, '');

    // 폴더 체인 생성/조회
    const folderId = await this.ensureFolderChain(projectId, normalizedFolder);

    let fileDoc = await this.fileRepo.findByProjectAndPath(projectId, relativePath);
    if (!fileDoc) {
      fileDoc = await this.fileRepo.create({ projectId, path: relativePath, folderId });
    }

    const { commitId } = await this.git.addAndCommit(
      projectId,
      fileMeta.path,
      relativePath,
      message,
      authorProfile
    );

    const repoBaseUrl = process.env.BACKEND_ORIGIN || `http://localhost:${process.env.PORT || 4000}`;
    const repoRelPath = path.join(projectId.toString(), relativePath).replace(/\\/g, '/');
    const previewUrl = `${repoBaseUrl}/static/repos/${repoRelPath}`;

    const reviewRequired = project.settings?.versioning?.reviewRequired !== false;
    const requiredApprovals = project.settings?.versioning?.minApprovals || 1;
    const status = reviewRequired ? 'pending_review' : 'approved';

    const version = await this.versionRepo.create({
      projectId,
      fileId: fileDoc._id,
      commitId,
      parentCommitIds: [],
      branch,
      message,
      authorId,
      status,
      artifacts: {
        storageKey: path.join(this.git.getRepoPath(projectId), relativePath),
        previewUrl
      },
      review: {
        requiredApprovals,
        approvals: []
      }
    });

    await this.fileRepo.updateById(fileDoc._id, { latestVersionId: version._id });

    return { file: fileDoc, version, commitId, repoPath: this.git.getRepoPath(projectId) };
  }

  async ensureFolderChain(projectId, folderPath) {
    if (!folderPath || folderPath === '/') return null;
    const parts = folderPath.split('/').filter(Boolean);
    let currentPath = '';
    let parentId = null;

    for (const part of parts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      let folder = await this.folderRepo.findByPath(projectId, currentPath);
      if (!folder) {
        folder = await this.folderRepo.create({
          projectId,
          parentFolderId: parentId,
          name: part,
          path: currentPath
        });
      }
      parentId = folder._id;
    }

    return parentId;
  }
}
