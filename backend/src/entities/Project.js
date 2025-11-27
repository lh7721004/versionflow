import mongoose from 'mongoose';

const { Schema, Types: { ObjectId } } = mongoose;

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  ownerId: { type: ObjectId, ref: 'User', required: true },
  repoPath: { type: String }, // simple-git 리포지토리 경로
  members: [{
    userId: { type: ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'maintainer', 'member'], required: true },
    joinedAt: { type: Date, default: Date.now },
  }],
  settings: {
    versioning: {
      namingScheme: {
        type: String,
        enum: ['date-major', 'major-minor', 'semver'],
        default: 'semver' // 'semver' => v{major}.{minor}.{patch}
      },
      reviewRequired: { type: Boolean, default: true }, // 모든 커밋 승인 필요 여부
      minApprovals: { type: Number, default: 1 } // 승인 최소 인원
    },
  },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
}, { timestamps: true });


// ProjectSchema.method('toPublic', function () {
//   const { _id, email, name, role, createdAt, updatedAt } = this;
//   return { id: _id.toString(), email, name, role, createdAt, updatedAt };
// });

export const ProjectModel = mongoose.model('Project', ProjectSchema);
