// import { NextFunction, Request, Response } from 'express';
// import { z } from 'zod';
//
// export const validateBody = (schema: z.ZodType) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const result = schema.safeParse(req.body);
//
//     if (!result.success) {
//       return res.status(400).json({
//         error: 'Помилка валідації',
//         details: z.flattenError(result.error).fieldErrors,
//       });
//     }
//
//     req.body = result.data;
//     next();
//   };
// };

import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

type ValidationTarget = 'body' | 'params' | 'query';

const createValidator = (target: ValidationTarget) => {
  return (schema: z.ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const result = schema.safeParse(req[target]);

      if (!result.success) {
        const flattened = z.flattenError(result.error);

        return res.status(400).json({
          error: flattened.formErrors[0] ?? 'Помилка валідації',
          details: flattened.fieldErrors,
        });
      }

      if (target === 'query') {
        Object.assign(req.query, result.data);
      } else {
        (req[target] as unknown) = result.data;
      }

      next();
    };
  };
};

export const validateBody = createValidator('body');
export const validateParams = createValidator('params');
export const validateQuery = createValidator('query');
