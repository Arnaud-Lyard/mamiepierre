import express from 'express';
import { authenticateUser } from '../../middleware/authenticateUser';
import {
  getMeHandler,
  getProfileHandler,
  getUserHandler,
  updateUserHandler,
} from '../controller/user.controller';

const router = express.Router();

router.get('/', authenticateUser, getUserHandler);

router.get('/me', getMeHandler);

router.post('/update', authenticateUser, updateUserHandler);

router.get('/profile', authenticateUser, getProfileHandler);

export default router;
