import { randomUUID } from 'crypto';
import { InvitationRepository } from '../repositories/invitation.repository.js';
import ApiError from '../utils/ApiError.js';
import { ProjectService } from './project.service.js';
import { sendMail } from '../utils/mailer.js';

export class InvitationService {
  constructor(repo = new InvitationRepository(), projectService = new ProjectService()) {
    this.repo = repo;
    this.projectService = projectService;
  }

  async create(payload) {
    const token = payload.token || randomUUID();
    const expiresAt = payload.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invitation = await this.repo.create({ ...payload, token, expiresAt });
    await this._sendInviteEmail(invitation);
    return invitation;
  }

  async get(id) {
    const invitation = await this.repo.findById(id);
    if (!invitation) throw new ApiError(404, 'Invitation not found');
    return invitation;
  }

  async findByToken(token) {
    return this.repo.findByToken(token);
  }

  async list(params) {
    return this.repo.list(params);
  }

  async respond(id, decision) {
    if (!['accepted', 'declined'].includes(decision)) {
      throw new ApiError(400, 'Invalid decision');
    }
    const updated = await this.repo.updateById(id, {
      status: decision,
      respondedAt: new Date()
    });
    if (!updated) throw new ApiError(404, 'Invitation not found');
    return updated;
  }

  async acceptByToken(token, userId) {
    if (!token || !userId) throw new ApiError(400, 'token and userId required');
    const invitation = await this.repo.findByToken(token);
    if (!invitation) throw new ApiError(404, 'Invitation not found');
    if (invitation.status !== 'pending') throw new ApiError(400, 'Invitation already processed');
    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      await this.repo.updateById(invitation._id, { status: 'expired' });
      throw new ApiError(400, 'Invitation expired');
    }

    await this.projectService.addMember(invitation.projectId, {
      userId,
      role: invitation.role || 'member',
      joinedAt: new Date()
    });

    const updated = await this.repo.updateById(invitation._id, {
      status: 'accepted',
      respondedAt: new Date(),
      inviteeId: userId
    });

    return updated;
  }

  async expire(id) {
    const updated = await this.repo.updateById(id, { status: 'expired' });
    if (!updated) throw new ApiError(404, 'Invitation not found');
    return updated;
  }

  async _sendInviteEmail(invitation) {
    const frontendBase = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
    const acceptUrl = `${frontendBase}/invite/accept?token=${invitation.token}`;
    const subject = `프로젝트 초대: ${invitation.projectId}`;
    const html = `
      <div style="font-family:sans-serif;max-width:480px;padding:16px;">
        <h2>프로젝트 초대</h2>
        <p>프로젝트에 초대되었습니다. 아래 버튼을 눌러 초대를 수락해 주세요.</p>
        <p>역할: <b>${invitation.role || 'member'}</b></p>
        <a href="${acceptUrl}" style="display:inline-block;padding:10px 14px;background:#4F46E5;color:#fff;border-radius:6px;text-decoration:none;">초대 수락</a>
        <p>만료일: ${invitation.expiresAt ? new Date(invitation.expiresAt).toISOString() : '없음'}</p>
        <p>혹은 아래 링크를 복사해 브라우저에 붙여 넣으세요:</p>
        <p>${acceptUrl}</p>
      </div>
    `;
    await sendMail({ to: invitation.inviteeEmail, subject, html });
  }
}
