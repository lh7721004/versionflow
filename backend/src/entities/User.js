import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  kakaoId: { type: String, unique: true, sparse: true },
  googleId: { type: String, unique: true, sparse: true },
  email: String,
  name: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatarUrl: String,
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: Date,
});

UserSchema.method('toPublic', function () {
  const { _id, kakaoId, email, name, avatarUrl, role, createdAt, lastLoginAt } = this;
  return {
    id: _id.toString(),
    kakaoId,
    email,
    name,
    avatarUrl,
    role,
    createdAt,
    lastLoginAt
  };
});

export const UserModel = mongoose.model('User', UserSchema);
