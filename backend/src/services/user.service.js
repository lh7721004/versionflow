import { UserRepository } from '../repositories/user.repository.js';
import ApiError from '../utils/ApiError.js';

export class UserService {
  constructor(repo = new UserRepository()) {
    this.repo = repo;
  }

  async register({ kakaoId, email, name, avatarUrl, role } = {}) {
    if (!kakaoId) throw new ApiError(400, 'kakaoId is required');

    const now = new Date();
    const existing = await this.repo.findByKakaoId(kakaoId);

    if (existing) {
      const updated = await this.repo.updateById(existing._id, {
        email,
        name,
        avatarUrl,
        role,
        lastLoginAt: now
      });
      return updated.toPublic();
    }

    const created = await this.repo.create({
      kakaoId,
      email,
      name,
      avatarUrl,
      role,
      lastLoginAt: now
    });

    return created.toPublic();
  }

  async get(id) {
    const user = await this.repo.findById(id);
    if (!user) throw new ApiError(404, 'User not found');
    return user.toPublic();
  }

  async list(params) {
    const page = await this.repo.list(params);
    return {
      ...page,
      items: page.items.map((u) => u.toPublic())
    };
  }

  async update(id, patch) {
    const updated = await this.repo.updateById(id, patch);
    if (!updated) throw new ApiError(404, 'User not found');
    return updated.toPublic();
  }

  async remove(id) {
    const deleted = await this.repo.deleteById(id);
    if (!deleted) throw new ApiError(404, 'User not found');
    return { id };
  }
}
