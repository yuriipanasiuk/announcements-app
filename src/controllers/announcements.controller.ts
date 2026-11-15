import { Request, Response } from 'express';
import prisma from '../../prisma/client.ts';
import {
  AnnouncementParams,
  CreateAnnouncementBody,
  UpdateAnnouncementBody,
} from '../types/types.ts';

const announcementInclude = {
  user: {
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
    },
  },
} as const;

export const getAllAnnouncements = async (req: Request, res: Response) => {
  const pageParam = Number(req.query.page);
  const page = pageParam && pageParam > 0 ? pageParam : 1;
  const perPage = 10;
  const skip = (page - 1) * perPage;

  const search = typeof req.query.search === 'string' ? req.query.search : '';
  const sort = req.query.sort === 'oldest' ? 'asc' : 'desc';

  const where = search
    ? {
        title: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }
    : {};

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy: {
        createdAt: sort,
      },
      skip,
      take: perPage,
      include: announcementInclude,
    }),

    prisma.announcement.count({ where }),
  ]);

  return res.status(200).json({
    data: announcements,
    pagination: {
      total,
      page,
      totalPages: Math.ceil(total / perPage),
      perPage,
    },
  });
};

export const getAnnouncementById = async (
  req: Request<AnnouncementParams>,
  res: Response
) => {
  const { id } = req.params;

  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: announcementInclude,
  });

  if (!announcement) {
    return res.status(404).json({
      error: 'Оголошення не знайдено',
    });
  }

  return res.status(200).json(announcement);
};

export const createAnnouncement = async (
  req: Request<{}, {}, CreateAnnouncementBody>,
  res: Response
) => {
  const { title, category, description, price } = req.body;

  const userId = Number(req.user?.sub);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(401).json({
      error: 'Неавторизований користувач',
    });
  }

  const announcement = await prisma.announcement.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      price,
      category,
      userId,
    },
    include: announcementInclude,
  });

  res.status(201).json(announcement);
};

export const updateAnnouncementById = async (
  req: Request<AnnouncementParams, {}, UpdateAnnouncementBody>,
  res: Response
) => {
  const { id } = req.params;

  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    return res.status(404).json({
      error: 'Оголошення не знайдено',
    });
  }

  const currentUserId = Number(req.user?.sub);

  if (announcement.userId !== currentUserId) {
    return res.status(403).json({
      error: 'Access denied',
    });
  }

  const updatedAnnouncement = await prisma.announcement.update({
    where: { id },
    data: req.body,
    include: announcementInclude,
  });

  return res.status(200).json(updatedAnnouncement);
};

export const deleteAnnouncementById = async (
  req: Request<AnnouncementParams>,
  res: Response
) => {
  const { id } = req.params;

  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    return res.status(404).json({
      error: 'Оголошення не знайдено',
    });
  }

  if (announcement.userId !== Number(req.user?.sub)) {
    return res.status(403).json({
      error: 'Access denied',
    });
  }

  await prisma.announcement.delete({ where: { id } });

  res.status(204).end();
};
