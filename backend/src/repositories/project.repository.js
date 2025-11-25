import { ProjectModel } from '../entities/Project.js';

export class ProjectRepository {
  constructor(model = ProjectModel) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findById(id) {
    return this.model.findById(id);
  }

  async list({ page = 1, limit = 10, sort = '-createdAt', ownerId, memberUserId, status } = {}) {
    const query = {};
    if (ownerId) query.ownerId = ownerId;
    if (status) query.status = status;
    if (memberUserId) query['members.userId'] = memberUserId;

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

  async addMember(projectId, member) {
    return this.model.findByIdAndUpdate(
      projectId,
      { $addToSet: { members: member } },
      { new: true }
    );
  }

  async removeMember(projectId, userId) {
    return this.model.findByIdAndUpdate(
      projectId,
      { $pull: { members: { userId } } },
      { new: true }
    );
  }

  async updateMemberRole(projectId, userId, role) {
    return this.model.findByIdAndUpdate(
      projectId,
      { $set: { 'members.$[m].role': role } },
      { new: true, arrayFilters: [{ 'm.userId': userId }] }
    );
  }

  _sanitizePatch(patch = {}) {
    const allowed = ['name', 'description', 'settings', 'status', 'ownerId', 'members', 'repoPath'];
    return Object.entries(patch).reduce((acc, [key, value]) => {
      if (allowed.includes(key) && value !== undefined) acc[key] = value;
      return acc;
    }, {});
  }
}
