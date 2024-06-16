import multer from 'multer';
import express from 'express';
import AppError from '../../utils/appError';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('file');

router.post('/', (req, res, next) =>
  upload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          new AppError(400, 'File size is too large. Maximum size is 5MB.')
        );
      }
    } else if (err) {
      return next(
        new AppError(500, 'An unknown error occurred during file upload.')
      );
    }

    if (!req.file) {
      new AppError(400, 'No file uploaded.');
    }
    res.status(200).json({
      status: 'success',
      message: 'No file uploaded.',
    });
  })
);

export default router;
