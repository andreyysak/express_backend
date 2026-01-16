import { Request, Response } from 'express';
import { prisma } from '../db';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../class/AppError';

const getUserTelegramId = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    select: { telegram_user_id: true }
  });
  if (!user) throw new AppError('User not found', 404);
  return user.telegram_user_id;
};

export const getAllTrips = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const telegram_user_id = await getUserTelegramId(userId);

  const data = await prisma.trip.findMany({
    where: { telegram_user_id },
    orderBy: { created_at: 'desc' }
  });
  res.json(data);
});

export const createTrip = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const telegram_user_id = await getUserTelegramId(userId);
  const { kilometrs, direction } = req.body;

  const item = await prisma.trip.create({
    data: {
      telegram_user_id,
      kilometrs,
      direction
    }
  });
  res.status(201).json(item);
});

export const updateTrip = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const telegram_user_id = await getUserTelegramId(userId);
  const id = Number(req.params.id);

  const result = await prisma.trip.updateMany({
    where: {
      trip_id: id,
      telegram_user_id
    },
    data: req.body
  });

  if (result.count === 0) {
    throw new AppError('Trip not found or access denied', 404);
  }

  const updatedItem = await prisma.trip.findUnique({
    where: { trip_id: id }
  });

  res.json(updatedItem);
});

export const deleteTrip = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const telegram_user_id = await getUserTelegramId(userId);
  const id = Number(req.params.id);

  const result = await prisma.trip.deleteMany({
    where: {
      trip_id: id,
      telegram_user_id
    }
  });

  if (result.count === 0) {
    throw new AppError('Trip not found or access denied', 404);
  }

  res.status(204).send();
});

export const getTripById = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const telegram_user_id = await getUserTelegramId(userId);
  const id = Number(req.params.id);

  const item = await prisma.trip.findFirst({
    where: {
      trip_id: id,
      telegram_user_id
    }
  });

  if (!item) {
    throw new AppError('Trip not found', 404);
  }

  res.json(item);
});

export const getTripsByDirection = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const telegram_user_id = await getUserTelegramId(userId);
  const { query } = req.query;

  if (!query) {
    throw new AppError('Search query is required', 400);
  }

  const data = await prisma.trip.findMany({
    where: {
      telegram_user_id,
      direction: { contains: String(query), mode: 'insensitive' }
    }
  });
  res.json(data);
});