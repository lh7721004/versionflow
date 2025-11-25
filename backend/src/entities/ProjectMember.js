import mongoose from 'mongoose';

const { Schema, Types: { ObjectId } } = mongoose;

// 프로젝트별 지역적 권한을 나타내는 멤버십 스키마
const ProjectMemberSchema = new Schema({
  projectId: { type: ObjectId, ref: 'Project', required: true },
  userId: { type: ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'maintainer', 'member'], required: true, default: 'member' },
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// 한 유저가 같은 프로젝트에 중복 등록되지 않도록 유니크 인덱스
ProjectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

export const ProjectMemberModel = mongoose.model('ProjectMember', ProjectMemberSchema);
