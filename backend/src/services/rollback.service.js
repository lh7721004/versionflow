import { RollbackRepository } from '../repositories/rollback.repository.js';
import ApiError from '../utils/ApiError.js';
import { GitService } from './git.service.js';

export class RollbackService {
  constructor(repo = new RollbackRepository(), git = new GitService()) {
    this.repo = repo;
    this.git = git;
  }

  async create(payload) {
    return this.repo.create(payload);
  }

  async get(id) {
    const rollback = await this.repo.findById(id);
    if (!rollback) throw new ApiError(404, 'Rollback not found');
    return rollback;
  }

  async listByProject(projectId, params) {
    return this.repo.listByProject(projectId, params);
  }

  async update(id, patch) {
    const updated = await this.repo.updateById(id, patch);
    if (!updated) throw new ApiError(404, 'Rollback not found');
    return updated;
  }

  async remove(id) {
    const deleted = await this.repo.deleteById(id);
    if (!deleted) throw new ApiError(404, 'Rollback not found');
    return { id };
  }

  async executeRollback(projectId, targetCommitId, initiatorId, note) {
    if (!projectId || !targetCommitId) throw new ApiError(400, 'projectId and targetCommitId required');
    await this.git.checkout(projectId, targetCommitId);
    return this.create({
      projectId,
      targetCommitId,
      initiatorId,
      note,
      status: 'completed',
      completedAt: new Date()
    });
  }
}
