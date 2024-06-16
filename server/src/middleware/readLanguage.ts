import { NextFunction, Request, Response } from 'express';
import { Lang } from '../types/lang';

export const readLanguage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const lang = req.acceptsLanguages('fr', 'en');

  if (lang) {
    req.language = lang as Lang;
  } else {
    req.language = 'fr';
  }
  next();
};
