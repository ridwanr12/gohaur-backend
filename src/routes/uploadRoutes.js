import express from 'express';
import { uploadImage } from '../middlewares/upload.js';
import authMiddleware from '../middlewares/auth.js';
import ApiResponse from '../utils/ApiResponse.js';
import AppError from '../utils/AppError.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: Upload gambar (foto toko, produk, bukti pembayaran)
 */

/**
 * @swagger
 * /api/uploads:
 *   post:
 *     summary: Upload satu gambar
 *     tags: [Uploads]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: URL gambar
 */
router.post('/', authMiddleware, uploadImage.single('file'), (req, res) => {
  if (!req.file) {
    throw new AppError('File is required', 400);
  }

  res.status(201).json(
    ApiResponse.success(
      {
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
        size: req.file.size,
      },
      'File uploaded successfully',
    ),
  );
});

export default router;
