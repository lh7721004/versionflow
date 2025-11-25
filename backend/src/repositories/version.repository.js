import { VersionModel } from '../entities/Version.js';

export class VersionRepository {
  constructor(model = VersionModel) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findById(id) {
    return this.model.findById(id);
  }

  async findByCommitId(commitId) {
    return this.model.findOne({ commitId });
  }

  async list({ projectId, branch, status, fileId, page = 1, limit = 10, sort = '-createdAt' } = {}) {
    const query = {};
    if (projectId) query.projectId = projectId;
    if (branch) query.branch = branch;
    if (status) query.status = status;
    if (fileId) query.fileId = fileId;

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

  async addApproval(id, approval) {
    return this.model.findByIdAndUpdate(
      id,
      { $push: { 'review.approvals': approval } },
      { new: true }
    );
  }

  async setStatus(id, status) {
    return this.model.findByIdAndUpdate(id, { status }, { new: true });
  }

  _sanitizePatch(patch = {}) {
    const allowed = [
      'projectId',
      'fileId',
      'commitId',
      'parentCommitIds',
      'branch',
      'message',
      'authorId',
      'status',
      'review',
      'artifacts'
    ];
    return Object.entries(patch).reduce((acc, [key, value]) => {
      if (allowed.includes(key) && value !== undefined) acc[key] = value;
      return acc;
    }, {});
  }
}

