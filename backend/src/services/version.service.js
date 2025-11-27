import { VersionRepository } from '../repositories/version.repository.js';
import ApiError from '../utils/ApiError.js';

export class VersionService {
  constructor(repo = new VersionRepository()) {
    this.repo = repo;
  }

  async create(payload) {
    return this.repo.create(payload);
  }

  async get(id) {
    const version = await this.repo.findById(id);
    if (!version) throw new ApiError(404, 'Version not found');
    return version;
  }

  async findByCommitId(commitId) {
    return this.repo.findByCommitId(commitId);
  }

  async list(params) {
    return this.repo.list(params);
  }

  async listHistory(params) {
    const { sort, ...rest } = params || {};
    return this.repo.list({ sort: sort || '-createdAt', ...rest });
  }

  async update(id, patch) {
    const updated = await this.repo.updateById(id, patch);
    if (!updated) throw new ApiError(404, 'Version not found');
    return updated;
  }

  async addApproval(id, approval) {
    const updated = await this.repo.addApproval(id, approval);
    if (!updated) throw new ApiError(404, 'Version not found');
    return updated;
  }

  async setStatus(id, status) {
    const updated = await this.repo.setStatus(id, status);
    if (!updated) throw new ApiError(404, 'Version not found');
    return updated;
  }
}
