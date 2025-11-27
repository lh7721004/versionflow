import ApiError from '../utils/ApiError.js';
import { FolderRepository } from '../repositories/folder.repository.js';

export class FolderService {
  constructor(repo = new FolderRepository()) {
    this.repo = repo;
  }

  async create({ projectId, parentFolderId = null, name }) {
    if (!projectId || !name) throw new ApiError(400, 'projectId and name are required');
    const path = parentFolderId
      ? await this._buildPath(projectId, parentFolderId, name)
      : name;

    const existing = await this.repo.findByPath(projectId, path);
    if (existing) throw new ApiError(409, 'Folder already exists');

    return this.repo.create({ projectId, parentFolderId, name, path });
  }

  async list(projectId) {
    if (!projectId) throw new ApiError(400, 'projectId is required');
    return this.repo.listByProject(projectId);
  }

  async remove(id) {
    if (!id) throw new ApiError(400, 'id is required');
    const deleted = await this.repo.deleteById(id);
    if (!deleted) throw new ApiError(404, 'Folder not found');
    return { id };
  }

  async _buildPath(projectId, parentFolderId, name) {
    const parent = await this.repo.findById(parentFolderId);
    if (!parent || parent.projectId.toString() !== projectId.toString()) {
      throw new ApiError(400, 'Invalid parentFolderId');
    }
    return `${parent.path}/${name}`;
  }
}
