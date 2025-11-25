import mongoose from 'mongoose';

const { Schema, Types: { ObjectId } } = mongoose;

// previews
const PreviewSchema = new Schema({
  projectId: { type: ObjectId, ref: 'Project', required: true },
  fileId: { type: ObjectId, ref: 'File' },
  versionId: { type: ObjectId, ref: 'Version', required: true },
  previewUrl: String,
  generatedAt: { type: Date, default: Date.now },
});

PreviewSchema.index({ versionId: 1 });

export const PreviewModel = mongoose.model('Preview', PreviewSchema);
