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
  announcementIdSchema,
  createAnnouncementSchema,
  queryAnnouncementsSchema,
  updateAnnouncementSchema,
} from '../validators/announcements.validator.ts';

const announcementsRouter = Router();

announcementsRouter.get(
  '/',
  validateQuery(queryAnnouncementsSchema),
  getAllAnnouncements
);
announcementsRouter.get(
  '/:id',
  validateParams(announcementIdSchema),
  getAnnouncementById
);

announcementsRouter.post(
  '/',
  validateBody(createAnnouncementSchema),
  createAnnouncement
);

announcementsRouter.patch(
  '/:id',
  validateParams(announcementIdSchema),
  validateBody(updateAnnouncementSchema),
  updateAnnouncementById
);
announcementsRouter.delete(
  '/:id',
  validateParams(announcementIdSchema),
  deleteAnnouncementById
);

export default announcementsRouter;
