import { Request, Response } from 'express';
import { prisma } from '../db';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../class/AppError';

export const getAllFuel = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const data = await prisma.fuel.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' }
  });
  res.json(data);
});

export const createFuel = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const { liters, price, station } = req.body;

  const item = await prisma.fuel.create({
    data: {
      user_id: userId,
      liters,
      price,
      station
    }
  });
  res.status(201).json(item);
});

export const updateFuel = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const id = Number(req.params.id);

  const result = await prisma.fuel.updateMany({
    where: {
      gas_id: id,
      user_id: userId
    },
    data: req.body
  });

  if (result.count === 0) {
    throw new AppError('Fuel record not found or access denied', 404);
  }

  const updatedItem = await prisma.fuel.findUnique({
    where: { gas_id: id }
  });

  res.json(updatedItem);
});

export const deleteFuel = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const id = Number(req.params.id);

  const result = await prisma.fuel.deleteMany({
    where: {
      gas_id: id,
      user_id: userId
    }
  });

  if (result.count === 0) {
    throw new AppError('Fuel record not found or access denied', 404);
  }

  res.status(204).send();
});

export const getFuelById = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const id = Number(req.params.id);

  const item = await prisma.fuel.findFirst({
    where: {
      gas_id: id,
      user_id: userId
    }
  });

  if (!item) {
    throw new AppError('Fuel record not found', 404);
  }

  res.json(item);
});

export const searchFuelByStation = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const { station } = req.query;

  if (!station) {
    throw new AppError('Station query parameter is required', 400);
  }

  const data = await prisma.fuel.findMany({
    where: {
      user_id: userId,
      station: { contains: String(station), mode: 'insensitive' }
    }
  });
  res.json(data);
});