import { PreviewRepository } from '../repositories/preview.repository.js';
import ApiError from '../utils/ApiError.js';

export class PreviewService {
  constructor(repo = new PreviewRepository()) {
    this.repo = repo;
  }

  async create(payload) {
    return this.repo.create(payload);
  }

  async get(id) {
    const preview = await this.repo.findById(id);
    if (!preview) throw new ApiError(404, 'Preview not found');
    return preview;
  }

  async findByVersion(versionId) {
    return this.repo.findByVersion(versionId);
  }

  async findLatestForFile(fileId) {
    return this.repo.findLatestForFile(fileId);
  }

  async listByProject(projectId, params) {
    return this.repo.listByProject(projectId, params);
  }

  async remove(id) {
    const deleted = await this.repo.deleteById(id);
    if (!deleted) throw new ApiError(404, 'Preview not found');
    return { id };
  }
}

