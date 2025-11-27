import asyncHandler from '../middlewares/asyncHandler.js';
import { VersionService } from '../services/version.service.js';

const versionService = new VersionService();

export const createVersion = asyncHandler(async (req, res) => {
  const data = await versionService.create(req.body);
  res.status(201).json({ data });
});

export const getVersion = asyncHandler(async (req, res) => {
  const data = await versionService.get(req.params.id);
  res.json({ data });
});

export const listVersions = asyncHandler(async (req, res) => {
  const { projectId, branch, status, fileId, page, limit, sort } = req.query;
  const data = await versionService.list({
    projectId,
    branch,
    status,
    fileId,
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sort
  });
  res.json({ data });
});

export const listVersionHistory = asyncHandler(async (req, res) => {
  const { projectId, branch, status, fileId, page, limit, sort } = req.query;
  const data = await versionService.listHistory({
    projectId,
    branch,
    status,
    fileId,
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    sort: sort || '-createdAt'
  });
  res.json({ data });
});

export const updateVersion = asyncHandler(async (req, res) => {
  const data = await versionService.update(req.params.id, req.body);
  res.json({ data });
});

export const addVersionApproval = asyncHandler(async (req, res) => {
  const data = await versionService.addApproval(req.params.id, req.body);
  res.json({ data });
});

export const setVersionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const data = await versionService.setStatus(req.params.id, status);
  res.json({ data });
});
