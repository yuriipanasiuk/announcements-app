import { NextFunction, Request, Response } from 'express';
import prisma from '../../prisma/client.ts';
import { createAnnouncementType } from '../types/types.ts';

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

export const getAllAnnouncements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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
  } catch (e) {
    next(e);
  }
};

export const getAnnouncementById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const announcementId = parseInt(req.params.id);

    if (!Number.isInteger(announcementId) || announcementId <= 0) {
      return res.status(400).json({
        error: 'ID має бути додатнім числом',
      });
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      include: announcementInclude,
    });

    if (!announcement) {
      return res.status(404).json({
        error: 'Оголошення не знайдено',
      });
    }

    return res.status(200).json(announcement);
  } catch (e) {
    next(e);
  }
};

export const createAnnouncement = async (
  req: Request<{}, {}, createAnnouncementType>,
  res: Response,
  next: NextFunction
) => {
  try {
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
  } catch (e) {
    next(e);
  }
};

export const updateAnnouncementById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const announcementId = parseInt(req.params.id);

    if (!Number.isInteger(announcementId) || announcementId <= 0) {
      return res.status(400).json({
        error: 'ID має бути додатнім числом',
      });
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
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
      where: { id: announcementId },
      data: req.body,
      include: announcementInclude,
    });

    return res.status(200).json(updatedAnnouncement);
  } catch (e) {
    next(e);
  }
};

export const deleteAnnouncementById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const announcementId = parseInt(req.params.id);

    if (!Number.isInteger(announcementId) || announcementId <= 0) {
      return res.status(400).json({
        error: 'ID має бути додатнім числом',
      });
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
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

    await prisma.announcement.delete({ where: { id: announcementId } });

    res.status(204).end();
  } catch (e) {
    next(e);
  }
};
