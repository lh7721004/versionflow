import { PreviewModel } from '../entities/Preview.js';

export class PreviewRepository {
  constructor(model = PreviewModel) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findById(id) {
    return this.model.findById(id);
  }

  async findByVersion(versionId) {
    return this.model.findOne({ versionId });
  }

  async findLatestForFile(fileId) {
    return this.model.findOne({ fileId }).sort('-generatedAt');
  }

  async listByProject(projectId, { page = 1, limit = 10, sort = '-generatedAt' } = {}) {
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

  async deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }
}

