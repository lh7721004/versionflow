import { InvitationModel } from '../entities/Invitation.js';

export class InvitationRepository {
  constructor(model = InvitationModel) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findById(id) {
    return this.model.findById(id);
  }

  async findByToken(token) {
    return this.model.findOne({ token });
  }

  async list({ projectId, inviteeId, status, page = 1, limit = 10, sort = '-createdAt' } = {}) {
    const query = {};
    if (projectId) query.projectId = projectId;
    if (inviteeId) query.inviteeId = inviteeId;
    if (status) query.status = status;

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
    const allowed = ['status', 'respondedAt', 'inviteeId', 'inviteeEmail', 'expiresAt', 'token'];
    return Object.entries(patch).reduce((acc, [key, value]) => {
      if (allowed.includes(key) && value !== undefined) acc[key] = value;
      return acc;
    }, {});
  }
}

