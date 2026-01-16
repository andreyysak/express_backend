import { Request, Response } from 'express';
import { prisma } from '../db';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../class/AppError';

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const user = await prisma.user.findUnique({
    where: { user_id: userId }
  });

  if (!user) {
    throw new AppError('Користувача не знайдено', 404);
  }

  res.json(user);
});

export const updateEmail = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const { email } = req.body;

  const updatedUser = await prisma.user.update({
    where: { user_id: userId },
    data: { email }
  });

  res.json(updatedUser);
});

export const updatePhone = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const { phone } = req.body;

  const updatedUser = await prisma.user.update({
    where: { user_id: userId },
    data: { phone }
  });

  res.json(updatedUser);
});

export const updateLocation = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const { country, city } = req.body;

  const updatedUser = await prisma.user.update({
    where: { user_id: userId },
    data: { country, city }
  });

  res.json(updatedUser);
});

export const updateTelegramInfo = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const { telegram_name, telegram_username } = req.body;

  const updatedUser = await prisma.user.update({
    where: { user_id: userId },
    data: { telegram_name, telegram_username }
  });

  res.json(updatedUser);
});

export const updateImage = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const { image } = req.body;

  const updatedUser = await prisma.user.update({
    where: { user_id: userId },
    data: { image }
  });

  res.json(updatedUser);
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);

  await prisma.user.delete({
    where: { user_id: userId }
  });

  res.status(204).send();
});