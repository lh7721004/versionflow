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
      branchStrategy: String,
      reviewRequired: { type: Boolean, default: true },
      minApprovals: { type: Number, default: 1 },
      allowedFileTypes: [String],
      maxFileSizeMB: Number,
      autoMergeOnApproval: { type: Boolean, default: false },
    },
  },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
}, { timestamps: true });


// ProjectSchema.method('toPublic', function () {
//   const { _id, email, name, role, createdAt, updatedAt } = this;
//   return { id: _id.toString(), email, name, role, createdAt, updatedAt };
// });

export const ProjectModel = mongoose.model('Project', ProjectSchema);
