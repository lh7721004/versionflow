import { FolderModel } from '../entities/Folder.js';

export class FolderRepository {
  constructor(model = FolderModel) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findById(id) {
    return this.model.findById(id);
  }

  async findByPath(projectId, path) {
    return this.model.findOne({ projectId, path });
  }

  async listByProject(projectId) {
    return this.model.find({ projectId }).sort('path');
  }

  async listByProjectFlat(projectId) {
    const items = await this.listByProject(projectId);
    return items.map((f) => ({
      id: f._id.toString(),
      projectId: f.projectId,
      parentFolderId: f.parentFolderId,
      name: f.name,
      path: f.path,
      files: f.files || []
    }));
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }
}
