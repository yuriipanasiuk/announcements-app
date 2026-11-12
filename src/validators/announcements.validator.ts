import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z
    .string({ error: "Поле title є обов'язковим і має бути рядком" })
    .min(5, 'Мінімум 5 символів')
    .max(50, 'Максимум 50 символів'),
  description: z
    .string({ error: "Поле description є обов'язковим і має бути рядком" })
    .min(10, 'Мінімум 10 символів'),
  price: z
    .number({ error: "Поле price є обов'язковим і має бути числом" })
    .positive('Ціна має бути більшою за 0'),
  category: z.enum(['sale', 'service', 'job', 'other'], {
    error: "Поле category є обов'язковим (sale, service, job або other)",
  }),
});

export const updateAnnouncementSchema = createAnnouncementSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'Має бути передано хоча б одне поле для оновлення',
  });
