import { Request, Response } from 'express';

export const getAllAnnouncements = (req: Request, res: Response) => {
  res.json({
    message: 'Route works!',
  });
};

export const getAnnouncementById = (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Route works!',
  });
};

export const createAnnouncement = (req: Request, res: Response) => {
  res.status(201).json({
    message: 'Route works!',
  });
};

export const updateAnnouncementById = (req: Request, res: Response) => {
  res.json({
    message: 'Route works!',
  });
};

export const deleteAnnouncementById = (req: Request, res: Response) => {
  res.json({
    message: 'Route works!',
  });
};
