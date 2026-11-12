import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const validateBody = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Помилка валідації',
        details: z.flattenError(result.error).fieldErrors,
      });
    }

    req.body = result.data;
    next();
  };
};
