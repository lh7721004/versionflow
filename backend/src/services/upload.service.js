import fs from 'fs';
import path from 'path';
import { FileRepository } from '../repositories/file.repository.js';
import { VersionRepository } from '../repositories/version.repository.js';
import ApiError from '../utils/ApiError.js';
import { GitService } from './git.service.js';
import { ProjectRepository } from '../repositories/project.repository.js';

export class UploadService {
  constructor(
    fileRepo = new FileRepository(),
    versionRepo = new VersionRepository(),
    git = new GitService(),
    projectRepo = new ProjectRepository()
  ) {
    this.fileRepo = fileRepo;
    this.versionRepo = versionRepo;
    this.git = git;
    this.projectRepo = projectRepo;
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

    let fileDoc = await this.fileRepo.findByProjectAndPath(projectId, relativePath);
    if (!fileDoc) {
      fileDoc = await this.fileRepo.create({ projectId, path: relativePath });
    }

    const { commitId } = await this.git.addAndCommit(
      projectId,
      fileMeta.path,
      relativePath,
      message,
      authorProfile
    );

    const version = await this.versionRepo.create({
      projectId,
      fileId: fileDoc._id,
      commitId,
      parentCommitIds: [],
      branch,
      message,
      authorId,
      status: 'pending_review',
      artifacts: {
        storageKey: path.join(this.git.getRepoPath(projectId), relativePath),
        previewUrl: fileMeta.path
      }
    });

    await this.fileRepo.updateById(fileDoc._id, { latestVersionId: version._id });

    return { file: fileDoc, version, commitId, repoPath: this.git.getRepoPath(projectId) };
  }
}

