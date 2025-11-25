import asyncHandler from '../middlewares/asyncHandler.js';
import { PreviewService } from '../services/preview.service.js';

const previewService = new PreviewService();

export const createPreview = asyncHandler(async (req, res) => {
  const data = await previewService.create(req.body);
  res.status(201).json({ data });
});

export const getPreview = asyncHandler(async (req, res) => {
  const data = await previewService.get(req.params.id);
  res.json({ data });
});

export const listPreviewsByProject = asyncHandler(async (req, res) => {
  const { page, limit, sort } = req.query;
  const data = await previewService.listByProject(req.params.projectId, {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sort
  });
  res.json({ data });
});

export const findPreviewByVersion = asyncHandler(async (req, res) => {
  const data = await previewService.findByVersion(req.params.versionId);
  res.json({ data });
});

export const findLatestPreviewForFile = asyncHandler(async (req, res) => {
  const data = await previewService.findLatestForFile(req.params.fileId);
  res.json({ data });
});

export const deletePreview = asyncHandler(async (req, res) => {
  const data = await previewService.remove(req.params.id);
  res.json({ data });
});

