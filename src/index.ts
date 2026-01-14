import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import passport from 'passport';
import logger from './logger';

import './config/passport';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import fuelRoutes from './routes/fuel';
import tripRoutes from './routes/trip';
import maintenanceRoutes from './routes/maintenance';
import { authMiddleware } from './middlewares/authMiddleware';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

app.use(passport.initialize());
app.use(express.static('public'));

app.get('/docs', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/docs.html'));
});

app.use('/api/auth', authRoutes);
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/fuel', authMiddleware, fuelRoutes);
app.use('/api/trip', authMiddleware, tripRoutes);
app.use('/api/maintenance', authMiddleware, maintenanceRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});