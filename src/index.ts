import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import passport from 'passport';
import path from 'path';

import logger from './logger';
import './config/passport';

import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import fuelRoutes from './routes/fuel';
import tripRoutes from './routes/trip';
import notionRoutes from './routes/notion';
import maintenanceRoutes from './routes/maintenance';
import accountRoutes from './routes/account';
import categoryRoutes from './routes/category';
import transactionRoutes from './routes/transaction';
import weatherRoutes from './routes/weather';
import monoRoutes from './routes/monobank';
import statisticsRoutes from './routes/statistic';
import wishlistRoutes from './routes/wishlist';
import abusedbRoutes from './routes/abusedb';

import { authMiddleware } from './middlewares/authMiddleware';
import { AppError } from "./class/AppError";
import { globalErrorHandler } from "./middlewares/errorMiddleware";
import {initCronJobs} from "./services/cronService";
import {checkServerResources} from "./utils/serverMonitor";

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [];

app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use(passport.initialize());
app.use(express.static('public'));

app.get('/docs', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/docs.html'));
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/mono', monoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notion', notionRoutes);
app.use('/api/weather', weatherRoutes);

app.use('/api/', limiter);

app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/fuel', authMiddleware, fuelRoutes);
app.use('/api/trip', authMiddleware, tripRoutes);
app.use('/api/maintenance', authMiddleware, maintenanceRoutes);

app.use('/api/finance/account', accountRoutes);
app.use('/api/finance/category', categoryRoutes);
app.use('/api/finance/transaction', transactionRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/abusedb', abusedbRoutes);

app.get(/^(?!\/api).+/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

initCronJobs();

checkServerResources(true)

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});