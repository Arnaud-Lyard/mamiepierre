import { NextFunction } from 'express';
import {
  findUniqueUser,
  getUserInformations,
} from '../user/service/user.service';
import AppError from './appError';
import { verifyJwt } from './jwt';

export async function getUserInformationsByToken(
  next: NextFunction,
  access_token: string
) {
  if (!access_token) {
    return;
  }

  // Validate the access token
  const decoded = verifyJwt<{ sub: string }>(access_token);

  if (!decoded) {
    return next(new AppError(401, `Invalid token or user doesn't exist`));
  }

  // Check if the user still exist
  const user = await findUniqueUser(decoded.sub);

  if (!user) {
    return next(new AppError(401, `Invalid token or session has expired`));
  }

  const userInfos = await getUserInformations(user.id);
  return userInfos;
}
