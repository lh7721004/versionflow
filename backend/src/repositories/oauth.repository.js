import { UserModel } from '../entities/User.js';

export class OAuthRepository {
  constructor(model = UserModel) {
    this.model = model;
  }

  async findByKakaoId(kakaoId) {
    return this.model.findOne({ kakaoId });
  }

  async findByGoogleId(googleId) {
    return this.model.findOne({ googleId });
  }

  async create(data) {
    return this.model.create(data);
  }

  async updateById(id, patch) {
    const updates = this._sanitizePatch(patch);
    if (!Object.keys(updates).length) return this.model.findById(id);
    return this.model.findByIdAndUpdate(id, updates, { new: true });
  }

  _sanitizePatch(patch = {}) {
    const allowed = ['email', 'name', 'avatarUrl', 'role', 'lastLoginAt'];
    return Object.entries(patch).reduce((acc, [key, value]) => {
      if (allowed.includes(key) && value !== undefined) acc[key] = value;
      return acc;
    }, {});
  }
}
