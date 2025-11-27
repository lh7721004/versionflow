import mongoose from 'mongoose';

const { Schema, Types: { ObjectId } } = mongoose;

const FolderSchema = new Schema({
  projectId: { type: ObjectId, ref: 'Project', required: true },
  parentFolderId: { type: ObjectId, ref: 'Folder', default: null },
  name: { type: String, required: true },
  // 프로젝트 내 전체 경로 (e.g. "docs/design")
  path: { type: String, required: true },
  files: [{ type: ObjectId, ref: 'File' }]
}, { timestamps: true });

FolderSchema.index({ projectId: 1, path: 1 }, { unique: true });

export const FolderModel = mongoose.model('Folder', FolderSchema);
