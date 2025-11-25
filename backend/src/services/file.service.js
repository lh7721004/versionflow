import { FileRepository } from '../repositories/file.repository.js';
import ApiError from '../utils/ApiError.js';

export class FileService {
  constructor(repo = new FileRepository()) {
    this.repo = repo;
  }

  async create(payload) {
    return this.repo.create(payload);
  }

  async get(id) {
    const file = await this.repo.findById(id);
    if (!file) throw new ApiError(404, 'File not found');
    return file;
  }

  async findByProjectAndPath(projectId, path) {
    return this.repo.findByProjectAndPath(projectId, path);
  }

  async listByProject(projectId, params) {
    return this.repo.listByProject(projectId, params);
  }

  async update(id, patch) {
    const updated = await this.repo.updateById(id, patch);
    if (!updated) throw new ApiError(404, 'File not found');
    return updated;
  }

  async remove(id) {
    const deleted = await this.repo.deleteById(id);
    if (!deleted) throw new ApiError(404, 'File not found');
    return { id };
  }
}

