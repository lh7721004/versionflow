import { FileModel } from '../entities/File.js';

export class FileRepository {
  constructor(model = FileModel) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findById(id) {
    return this.model.findById(id);
  }

  async findByProjectAndPath(projectId, path) {
    return this.model.findOne({ projectId, path });
  }

  async listByProject(projectId, { page = 1, limit = 20, sort = 'path' } = {}) {
    const query = { projectId };
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.model.find(query).sort(sort).skip(skip).limit(limit),
      this.model.countDocuments(query)
    ]);
    return {
      items,
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit))
    };
  }

  async updateById(id, patch) {
    const updates = this._sanitizePatch(patch);
    if (!Object.keys(updates).length) return this.findById(id);
    return this.model.findByIdAndUpdate(id, updates, { new: true });
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }

  _sanitizePatch(patch = {}) {
    const allowed = ['path', 'latestVersionId'];
    return Object.entries(patch).reduce((acc, [key, value]) => {
      if (allowed.includes(key) && value !== undefined) acc[key] = value;
      return acc;
    }, {});
  }
}

