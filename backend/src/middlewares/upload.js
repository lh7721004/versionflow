import fs from 'fs';
import path from 'path';
import multer from 'multer';

const uploadRoot = path.join(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const projectId = req.params.projectId || req.params.id || 'common';
    const dest = path.join(uploadRoot, projectId);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

export const uploadSingle = multer({ storage }).single('file');
// export const uploadMulter = multer({ storage }).array('files', 10);

