import { Router } from 'express';
import {
  createAnnouncement,
  deleteAnnouncementById,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncementById,
} from '../controllers/announcements.controller.ts';
import { validateBody } from '../middleware/validate.ts';
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from '../validators/announcements.validator.ts';

const announcementsRouter = Router();

announcementsRouter.get('/', getAllAnnouncements);
announcementsRouter.get('/:id', getAnnouncementById);

announcementsRouter.post(
  '/',
  validateBody(createAnnouncementSchema),
  createAnnouncement
);

announcementsRouter.patch(
  '/:id',
  validateBody(updateAnnouncementSchema),
  updateAnnouncementById
);
announcementsRouter.delete('/:id', deleteAnnouncementById);

export default announcementsRouter;
