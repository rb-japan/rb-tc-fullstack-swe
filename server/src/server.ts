import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';
import logger from 'jet-logger';
import mongoose from 'mongoose';
import cors from 'cors';

import 'express-async-errors';

import BaseRouter from '@src/routes';

import Paths from '@src/common/Paths';
import EnvVars from '@src/common/EnvVars';
import HttpStatusCodes from '@src/common/HttpStatusCodes';
import { RouteError } from '@src/common/classes';
import { NodeEnvs } from '@src/common/misc';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(EnvVars.CookieProps.Secret));
app.use(cors());

if (EnvVars.NodeEnv === NodeEnvs.Dev.valueOf()) {
  app.use(morgan('dev'));
}

if (EnvVars.NodeEnv === NodeEnvs.Production.valueOf()) {
  app.use(helmet());
}

mongoose.connect(EnvVars.Mongo.Uri)
  .then(() => logger.info('Connected to MongoDB'))
  .catch((err) => logger.err(err));

app.use(Paths.Base, BaseRouter);

app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint works' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (EnvVars.NodeEnv !== NodeEnvs.Test.valueOf()) {
    logger.err(err, true);
  }

  if (err instanceof RouteError) {
    const status = err.status;
    res.status(status).json({ error: err.message });
  } else {
    res.status(HttpStatusCodes.BAD_REQUEST).json({ error: 'Something went wrong' });
  }
});

export default app;
