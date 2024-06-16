import express from 'express';
import { authenticateUser } from '../../middleware/authenticateUser';
import { validate } from '../../middleware/validate';
import {
  forgotPasswordHandler,
  loginUserHandler,
  logoutUserHandler,
  registerUserHandler,
  resetPasswordHandler,
  verifyEmailHandler,
} from '../controller/auth.controller';
import {
  forgotPasswordSchema,
  loginUserSchema,
  registerUserSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../schema/auth.schema';
import { readLanguage } from '../../middleware/readLanguage';

const router = express.Router();

router.post(
  '/register',
  readLanguage,
  validate(registerUserSchema),
  registerUserHandler
);

router.post(
  '/login',
  readLanguage,
  validate(loginUserSchema),
  loginUserHandler
);

router.get(
  '/verifyemail/:verificationCode',
  readLanguage,
  validate(verifyEmailSchema),
  verifyEmailHandler
);

router.get('/logout', readLanguage, authenticateUser, logoutUserHandler);

router.post(
  '/forgotpassword',
  readLanguage,
  validate(forgotPasswordSchema),
  forgotPasswordHandler
);

router.patch(
  '/resetpassword/:resetToken',
  readLanguage,
  validate(resetPasswordSchema),
  resetPasswordHandler
);

export default router;
