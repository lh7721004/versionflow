import mongoose from 'mongoose';

const { Schema, Types: { ObjectId } } = mongoose;

const FileSchema = new Schema({
  projectId: { type: ObjectId, ref: 'Project', required: true },
  path: { type: String, required: true },
  latestVersionId: { type: ObjectId, ref: 'Version' },
}, { timestamps: true });

FileSchema.index({ projectId: 1, path: 1 }, { unique: true });

export const FileModel = mongoose.model('File', FileSchema);
