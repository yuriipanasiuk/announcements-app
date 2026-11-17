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
  const { page = 1, limit = 10, search, category, sort } = res.locals.query;

  const skip = (page - 1) * limit;
  const order = sort === 'oldest' ? 'asc' : 'desc';

  const where = {
    ...(search && {
      title: {
        contains: search,
        mode: 'insensitive' as const,
      },
    }),
    ...(category && { category }),
  };

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy: {
        createdAt: order,
      },
      skip,
      take: limit,
      include: announcementInclude,
    }),

    prisma.announcement.count({ where }),
  ]);

  return res.status(200).json({
    data: announcements,
    pagination: {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
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
      error: 'Announcement not found',
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
      error: 'Unauthorized user',
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
      error: 'Announcement not found',
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
      error: 'Announcement not found',
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
