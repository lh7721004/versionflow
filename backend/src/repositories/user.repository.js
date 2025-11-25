import { UserModel } from '../entities/User.js';

export class UserRepository {
  constructor(model = UserModel) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findById(id) {
    return this.model.findById(id);
  }

  async findByKakaoId(kakaoId) {
    return this.model.findOne({ kakaoId });
  }

  async findByGoogleId(googleId) {
    return this.model.findOne({ googleId });
  }

  async findOneByEmail(email) {
    return this.model.findOne({ email });
  }

  async list({ page = 1, limit = 10, sort = '-createdAt' } = {}) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.model.find({}).sort(sort).skip(skip).limit(limit),
      this.model.countDocuments({})
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
    // allowed 배열 = 업데이트 가능한 필드 목록.
    const allowed = ['email', 'name', 'avatarUrl', 'role', 'lastLoginAt'];
    return Object.entries(patch).reduce((acc, [key, value]) => {
      if (allowed.includes(key) && value !== undefined) acc[key] = value;
      return acc;
    }, {});
  }
}
