import { z } from 'zod';
import {
  announcementIdSchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from '../validators/announcements.validator.ts';

export type CreateAnnouncementBody = z.infer<typeof createAnnouncementSchema>;

export type UpdateAnnouncementBody = z.infer<typeof updateAnnouncementSchema>;

export type AnnouncementParams = z.infer<typeof announcementIdSchema>;
