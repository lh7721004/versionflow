import asyncHandler from '../middlewares/asyncHandler.js';
import { FolderService } from '../services/folder.service.js';
import validateObjectId from '../middlewares/validateObjectId.js';

const folderService = new FolderService();

export const createFolder = asyncHandler(async (req, res) => {
  const { projectId, parentFolderId, name } = req.body;
  const data = await folderService.create({ projectId, parentFolderId, name });
  res.status(201).json({ data });
});

export const listFolders = asyncHandler(async (req, res) => {
  const { projectId } = req.query;
  const data = await folderService.list(projectId);
  res.json({ data });
});

export const deleteFolder = asyncHandler(async (req, res) => {
  const data = await folderService.remove(req.params.id);
  res.json({ data });
});

