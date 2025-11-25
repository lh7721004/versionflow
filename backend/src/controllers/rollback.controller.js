import asyncHandler from '../middlewares/asyncHandler.js';
import { RollbackService } from '../services/rollback.service.js';

const rollbackService = new RollbackService();

export const createRollback = asyncHandler(async (req, res) => {
  const data = await rollbackService.create(req.body);
  res.status(201).json({ data });
});

export const getRollback = asyncHandler(async (req, res) => {
  const data = await rollbackService.get(req.params.id);
  res.json({ data });
});

export const listRollbacks = asyncHandler(async (req, res) => {
  const { projectId, page, limit, sort } = req.query;
  if (!projectId) {
    return res.status(400).json({ message: 'projectId is required' });
  }
  const data = await rollbackService.listByProject(projectId, {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sort
  });
  res.json({ data });
});

export const updateRollback = asyncHandler(async (req, res) => {
  const data = await rollbackService.update(req.params.id, req.body);
  res.json({ data });
});

export const deleteRollback = asyncHandler(async (req, res) => {
  const data = await rollbackService.remove(req.params.id);
  res.json({ data });
});

export const executeRollback = asyncHandler(async (req, res) => {
  const { projectId, targetCommitId, initiatorId, note } = req.body;
  const data = await rollbackService.executeRollback(projectId, targetCommitId, initiatorId, note);
  res.status(201).json({ data });
});
