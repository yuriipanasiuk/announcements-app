import { Router } from 'express';
import {
  createAnnouncement,
  deleteAnnouncementById,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncementById,
} from '../controllers/announcements.controller.ts';

const announcementsRouter = Router();

announcementsRouter.get('/', getAllAnnouncements);
announcementsRouter.get('/:id', getAnnouncementById);
announcementsRouter.post('/', createAnnouncement);
announcementsRouter.patch('/:id', updateAnnouncementById);
announcementsRouter.delete('/:id', deleteAnnouncementById);

export default announcementsRouter;
