import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getMe,
  login,
  logout,
  refresh,
  register,
} from '../controllers/auth.controller.ts';
import { authenticate } from '../middleware/authenticate.ts';
import { validateBody } from '../middleware/validate.ts';
import {
  LoginSchema,
  RefreshSchema,
  RegisterSchema,
} from '../validators/auth.validator.ts';

export const authRoutes = Router();

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

authRoutes.use(strictLimiter);

authRoutes.post('/register', validateBody(RegisterSchema), register);
authRoutes.post('/login', validateBody(LoginSchema), login);
authRoutes.post('/refresh', validateBody(RefreshSchema), refresh);
authRoutes.post('/logout', authenticate, logout);
authRoutes.get('/me', authenticate, getMe);
