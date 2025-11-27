import mongoose from 'mongoose';

const { Schema, Types: { ObjectId } } = mongoose;

// invitations
const InvitationSchema = new Schema({
  projectId: { type: ObjectId, ref: 'Project', required: true },
  inviterId: { type: ObjectId, ref: 'User', required: true },
  inviteeEmail: { type: String, required: true },
  token: { type: String, unique: true, required: true },
  role: { type: String, enum: ['owner', 'maintainer', 'member'], required: true, default: 'member' },
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'expired'], default: 'pending' },
  expiresAt: Date,
  respondedAt: Date,
}, { timestamps: { createdAt: true, updatedAt: false } });

export const InvitationModel = mongoose.model('Invitation', InvitationSchema);
