import mongoose from 'mongoose';

const { Schema, Types: { ObjectId } } = mongoose;

// versions (커밋)
const VersionSchema = new Schema({
  projectId: { type: ObjectId, ref: 'Project', required: true },
  fileId: { type: ObjectId, ref: 'File' }, // 멀티파일 커밋이면 null
  commitId: { type: String, required: true, index: true },
  parentCommitIds: [String],
  branch: String,
  message: String,
  authorId: { type: ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'pending_review', 'approved', 'rejected', 'merged', 'rolled_back'], default: 'draft' },
  review: {
    requiredApprovals: { type: Number, default: 1 },
    approvals: [{
      userId: { type: ObjectId, ref: 'User', required: true },
      decision: { type: String, enum: ['approve', 'reject'], required: true },
      comment: String,
      at: { type: Date, default: Date.now },
    }],
  },
  artifacts: {
    storageKey: String,
    diff: Schema.Types.Mixed,
    previewUrl: String,
  },
}, { timestamps: true });

VersionSchema.index({ projectId: 1, branch: 1 });

export const VersionModel = mongoose.model('Version', VersionSchema);
