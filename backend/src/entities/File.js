import mongoose from 'mongoose';

const { Schema, Types: { ObjectId } } = mongoose;

const FileSchema = new Schema({
  projectId: { type: ObjectId, ref: 'Project', required: true },
  folderId: { type: ObjectId, ref: 'Folder' },
  path: { type: String, required: true }, // 프로젝트 루트 기준 전체 경로
  latestVersionId: { type: ObjectId, ref: 'Version' },
}, { timestamps: true });

FileSchema.index({ projectId: 1, path: 1 }, { unique: true });

export const FileModel = mongoose.model('File', FileSchema);
