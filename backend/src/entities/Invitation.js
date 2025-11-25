import mongoose from 'mongoose';

const { Schema, Types: { ObjectId } } = mongoose;

// invitations
const InvitationSchema = new Schema({
  projectId: { type: ObjectId, ref: 'Project', required: true },
  inviterId: { type: ObjectId, ref: 'User', required: true },
  inviteeId: { type: ObjectId, ref: 'User' },
  inviteeEmail: String,
  token: { type: String, unique: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'expired'], default: 'pending' },
  expiresAt: Date,
  respondedAt: Date,
}, { timestamps: { createdAt: true, updatedAt: false } });

export const InvitationModel = mongoose.model('Invitation', InvitationSchema);
