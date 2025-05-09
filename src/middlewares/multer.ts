// lib/multer.ts
import multer from 'multer';
import { NextApiRequest } from 'next';

// Configure memory storage
const storage = multer.memoryStorage();

// Properly typed file filter
const fileFilter = (
  req: NextApiRequest,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Only images and videos are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter: fileFilter as unknown as multer.Options['fileFilter'],
  limits: {
    fileSize: 1024 * 1024 * 100,
  },
});

export default upload;