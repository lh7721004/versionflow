import asyncHandler from '../middlewares/asyncHandler.js';
import { UploadService } from '../services/upload.service.js';

const uploadService = new UploadService();

export const uploadFileAndCommit = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { authorId, branch, folderPath, message, authorName, authorEmail } = req.body;
  if (!req.file) return res.status(400).json({ message: 'file is required' });

  const result = await uploadService.uploadAndCommit({
    projectId,
    folderPath,
    authorId,
    branch,
    message,
    authorProfile: { name: authorName, email: authorEmail },
    fileMeta: {
      filename: req.file.originalname,
      path: req.file.path
    }
  });

  res.status(201).json({ data: result });
});
