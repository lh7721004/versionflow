import { InvitationRepository } from '../repositories/invitation.repository.js';
import ApiError from '../utils/ApiError.js';

export class InvitationService {
  constructor(repo = new InvitationRepository()) {
    this.repo = repo;
  }

  async create(payload) {
    return this.repo.create(payload);
  }

  async get(id) {
    const invitation = await this.repo.findById(id);
    if (!invitation) throw new ApiError(404, 'Invitation not found');
    return invitation;
  }

  async findByToken(token) {
    return this.repo.findByToken(token);
  }

  async list(params) {
    return this.repo.list(params);
  }

  async respond(id, decision) {
    if (!['accepted', 'declined'].includes(decision)) {
      throw new ApiError(400, 'Invalid decision');
    }
    const updated = await this.repo.updateById(id, {
      status: decision,
      respondedAt: new Date()
    });
    if (!updated) throw new ApiError(404, 'Invitation not found');
    return updated;
  }

  async expire(id) {
    const updated = await this.repo.updateById(id, { status: 'expired' });
    if (!updated) throw new ApiError(404, 'Invitation not found');
    return updated;
  }
}

