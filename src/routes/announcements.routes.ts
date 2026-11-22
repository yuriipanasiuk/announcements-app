import { Router } from 'express';
import {
  createAnnouncement,
  deleteAnnouncementById,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncementById,
} from '../controllers/announcements.controller.ts';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middleware/validate.ts';
import {
  AnnouncementIdSchema,
  CreateAnnouncementSchema,
  QueryAnnouncementsSchema,
  UpdateAnnouncementSchema,
} from '../validators/announcements.validator.ts';
import { authenticate } from '../middleware/authenticate.ts';
import { uploadPhotoToCloudinary } from '../middleware/upload.ts';

const announcementsRouter = Router();

announcementsRouter.get(
  '/',
  validateQuery(QueryAnnouncementsSchema),
  getAllAnnouncements
);

announcementsRouter.get(
  '/:id',
  validateParams(AnnouncementIdSchema),
  getAnnouncementById
);

announcementsRouter.post(
  '/',
  authenticate,
  uploadPhotoToCloudinary('photo'),
  validateBody(CreateAnnouncementSchema),
  createAnnouncement
);

announcementsRouter.patch(
  '/:id',
  authenticate,
  validateParams(AnnouncementIdSchema),
  uploadPhotoToCloudinary('photo'),
  validateBody(UpdateAnnouncementSchema),
  updateAnnouncementById
);

announcementsRouter.delete(
  '/:id',
  authenticate,
  validateParams(AnnouncementIdSchema),
  deleteAnnouncementById
);

export default announcementsRouter;
