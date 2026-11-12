import { Router } from 'express';
import {
  getMe,
  login,
  logout,
  refresh,
  register,
} from '../controllers/auth.controller.ts';

export const authRoutes = Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/refresh', refresh);
authRoutes.post('/logout', logout);
authRoutes.get('/me', getMe);
