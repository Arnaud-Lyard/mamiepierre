require('dotenv').config();
import { PrismaClient } from '@prisma/client';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import path from 'path';
import authRouter from './auth/routes/auth.routes';
import userRouter from './user/routes/user.routes';
import uploadRouter from './upload/routes/upload.routes';
import AppError from './utils/appError';
import { validateEnv } from './utils/validateEnv';
import winston from 'winston';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';

let logtail;
if (process.env.NODE_ENV === 'production') {
  logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN);
}

validateEnv();

const prisma = new PrismaClient();
const app = express();

export const logger = winston.createLogger({
  level: 'http',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    winston.format.json()
  ),
  transports:
    process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.Console(),
          new LogtailTransport(logtail as Logtail),
        ]
      : [new winston.transports.Console()],
});

async function bootstrap() {
  // TEMPLATE ENGINE
  app.set('view engine', 'pug');
  app.set('views', `${__dirname}/views`);

  // MIDDLEWARE

  // 1.Body Parser
  app.use(express.json({ limit: '10kb' }));

  // 2. Cookie Parser
  app.use(cookieParser());

  // 2. Cors
  app.use(
    cors({
      origin: [process.env.CLIENT_URL],
      credentials: true,
    })
  );

  // 3. Logger
  const morganMiddleware = morgan(
    function (tokens, req, res) {
      return JSON.stringify({
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: Number.parseFloat(tokens.status(req, res) as string),
        content_length: tokens.res(req, res, 'content-length'),
        response_time: Number.parseFloat(
          tokens['response-time'](req, res) as string
        ),
      });
    },
    {
      stream: {
        write: (message) => {
          const data = JSON.parse(message);
          logger.http(`incoming-request`, data);
        },
      },
    }
  );

  app.use(morganMiddleware);

  // ROUTES
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/uploads', uploadRouter);

  // Testing
  app.get('/api', (_, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'Welcome to NodeJs with Prisma and PostgreSQL',
    });
  });

  const publicDirectoryPath =
    process.env.NODE_ENV === 'production'
      ? path.join(__dirname, '..', '..', 'public')
      : path.join(__dirname, '..', 'public');

  app.use(express.static(publicDirectoryPath));

  // UNHANDLED ROUTES
  app.all('*', (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(404, `Route ${req.originalUrl} not found`));
  });

  // GLOBAL ERROR HANDLER
  app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
    err.status = err.status || 'error';
    err.statusCode = err.statusCode || 500;

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  });

  const port = process.env.PORT;
  app.listen(port, () => {
    logger.info(`Server on port: ${port}`);
  });
}

bootstrap()
  .catch((err) => {
    throw err;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
