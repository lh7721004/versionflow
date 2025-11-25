import asyncHandler from '../middlewares/asyncHandler.js';
import { FileService } from '../services/file.service.js';

const fileService = new FileService();

export const createFile = asyncHandler(async (req, res) => {
  const data = await fileService.create(req.body);
  res.status(201).json({ data });
});

export const getFile = asyncHandler(async (req, res) => {
  const data = await fileService.get(req.params.id);
  res.json({ data });
});

export const listFilesByProject = asyncHandler(async (req, res) => {
  const { page, limit, sort } = req.query;
  const data = await fileService.listByProject(req.params.projectId, {
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    sort
  });
  res.json({ data });
});

export const updateFile = asyncHandler(async (req, res) => {
  const data = await fileService.update(req.params.id, req.body);
  res.json({ data });
});

export const deleteFile = asyncHandler(async (req, res) => {
  const data = await fileService.remove(req.params.id);
  res.json({ data });
});

