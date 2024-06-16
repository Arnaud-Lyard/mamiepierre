import { NextFunction, Request, Response } from 'express';
import { findUniqueUser } from '../user/service/user.service';
import AppError from '../utils/appError';
import { verifyJwt } from '../utils/jwt';

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let access_token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      access_token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.access_token) {
      access_token = req.cookies.access_token;
    }

    if (!access_token) {
      return next(
        new AppError(
          401,
          req.language === 'fr'
            ? "Vous n'êtes pas connecté."
            : 'You are not logged in.'
        )
      );
    }

    // Validate the access token
    const decoded = verifyJwt<{ sub: string }>(access_token);

    if (!decoded) {
      return next(
        new AppError(
          401,
          req.language === 'fr'
            ? 'Token invalide ou utilisateur inexistant.'
            : `Invalid token or user doesn't exist.`
        )
      );
    }

    // Check if the user still exist
    const user = await findUniqueUser(decoded.sub);

    if (!user) {
      return next(
        new AppError(
          401,
          req.language === 'fr'
            ? 'Token invalide ou session expirée.'
            : `Invalid token or session has expired.`
        )
      );
    }

    next();
  } catch (err: any) {
    next(err);
  }
};
