import { z } from 'zod';
import {
  AnnouncementIdSchema,
  CreateAnnouncementSchema,
  UpdateAnnouncementSchema,
} from '../validators/announcements.validator.ts';
import { LoginSchema, RegisterSchema } from '../validators/auth.validator.ts';

export type CreateAnnouncementBody = z.infer<typeof CreateAnnouncementSchema>;
export type UpdateAnnouncementBody = z.infer<typeof UpdateAnnouncementSchema>;
export type AnnouncementParams = z.infer<typeof AnnouncementIdSchema>;
export type RegisterUserBody = z.infer<typeof RegisterSchema>;
export type LoginUserBody = z.infer<typeof LoginSchema>;
