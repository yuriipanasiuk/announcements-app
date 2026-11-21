import fs from 'fs/promises';
import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

export const upload = multer({
  dest: 'uploads/',
});

export const uploadPhotoToCloudinary = (fieldName = 'photo') => [
  upload.single(fieldName),
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.file) {
      return next();
    }

    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'upload',
      });

      req.body.imageUrl = result.secure_url;

      req.log.info(
        {
          userId: req.user?.sub,
          imageUrl: result.secure_url,
        },
        'Photo uploaded to Cloudinary'
      );

      next();
    } catch {
      throw createHttpError(400, 'Failed to upload image');
    } finally {
      await fs.unlink(req.file.path).catch(() => {});
    }
  },
];
