import { ProjectRepository } from '../repositories/project.repository.js';
import ApiError from '../utils/ApiError.js';
import { GitService } from './git.service.js';

export class ProjectService {
  constructor(repo = new ProjectRepository(), git = new GitService()) {
    this.repo = repo;
    this.git = git;
  }

  async create(payload) {
    const project = await this.repo.create(payload);
    const repoPath = await this.git.ensureRepo(project._id.toString());
    project.repoPath = repoPath;
    await project.save();
    return project;
  }

  async get(id) {
    const project = await this.repo.findById(id);
    if (!project) throw new ApiError(404, 'Project not found');
    return project;
  }

  async list(params) {
    return this.repo.list(params);
  }

  async update(id, patch) {
    const updated = await this.repo.updateById(id, patch);
    if (!updated) throw new ApiError(404, 'Project not found');
    return updated;
  }

  async addMember(projectId, member) {
    const updated = await this.repo.addMember(projectId, member);
    if (!updated) throw new ApiError(404, 'Project not found');
    return updated;
  }

  async removeMember(projectId, userId) {
    const updated = await this.repo.removeMember(projectId, userId);
    if (!updated) throw new ApiError(404, 'Project not found');
    return updated;
  }

  async updateMemberRole(projectId, userId, role) {
    const updated = await this.repo.updateMemberRole(projectId, userId, role);
    if (!updated) throw new ApiError(404, 'Project not found');
    return updated;
  }
}
