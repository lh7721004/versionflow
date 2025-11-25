import asyncHandler from '../middlewares/asyncHandler.js';
import { InvitationService } from '../services/invitation.service.js';

const invitationService = new InvitationService();

export const createInvitation = asyncHandler(async (req, res) => {
  const data = await invitationService.create(req.body);
  res.status(201).json({ data });
});

export const getInvitation = asyncHandler(async (req, res) => {
  const data = await invitationService.get(req.params.id);
  res.json({ data });
});

export const listInvitations = asyncHandler(async (req, res) => {
  const { projectId, inviteeId, status, page, limit, sort } = req.query;
  const data = await invitationService.list({
    projectId,
    inviteeId,
    status,
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sort
  });
  res.json({ data });
});

export const respondInvitation = asyncHandler(async (req, res) => {
  const { decision } = req.body;
  const data = await invitationService.respond(req.params.id, decision);
  res.json({ data });
});

export const expireInvitation = asyncHandler(async (req, res) => {
  const data = await invitationService.expire(req.params.id);
  res.json({ data });
});

