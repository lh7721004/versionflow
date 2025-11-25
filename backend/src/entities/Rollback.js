import mongoose from 'mongoose';

const { Schema, Types: { ObjectId } } = mongoose;

// rollbacks
const RollbackSchema = new Schema({
  projectId: { type: ObjectId, ref: 'Project', required: true },
  targetCommitId: { type: String, required: true },
  initiatorId: { type: ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  note: String,
  completedAt: Date,
}, { timestamps: { createdAt: true, updatedAt: false } });

export const RollbackModel = mongoose.model('Rollback', RollbackSchema);
