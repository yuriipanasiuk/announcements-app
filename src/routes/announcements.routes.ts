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
  validateBody(CreateAnnouncementSchema),
  createAnnouncement
);

announcementsRouter.patch(
  '/:id',
  validateParams(AnnouncementIdSchema),
  validateBody(UpdateAnnouncementSchema),
  updateAnnouncementById
);
announcementsRouter.delete(
  '/:id',
  validateParams(AnnouncementIdSchema),
  deleteAnnouncementById
);

export default announcementsRouter;
