import { Request, Response } from 'express';
import { prisma } from '../db';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../class/AppError';

export const getAllMaintenance = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const data = await prisma.maintenance.findMany({
    where: { user_id: userId },
    orderBy: { date: 'desc' }
  });
  res.json(data);
});

export const createMaintenance = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const { date, description, odometer } = req.body;

  const item = await prisma.maintenance.create({
    data: {
      user_id: userId,
      date: new Date(date),
      description,
      odometer
    }
  });
  res.status(201).json(item);
});

export const updateMaintenance = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const id = Number(req.params.id);

  const result = await prisma.maintenance.updateMany({
    where: {
      maintenance_id: id,
      user_id: userId
    },
    data: req.body
  });

  if (result.count === 0) {
    throw new AppError('Maintenance record not found or access denied', 404);
  }

  const updatedItem = await prisma.maintenance.findUnique({
    where: { maintenance_id: id }
  });

  res.json(updatedItem);
});

export const deleteMaintenance = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const id = Number(req.params.id);

  const result = await prisma.maintenance.deleteMany({
    where: {
      maintenance_id: id,
      user_id: userId
    }
  });

  if (result.count === 0) {
    throw new AppError('Maintenance record not found or access denied', 404);
  }

  res.status(204).send();
});

export const getMaintenanceById = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const id = Number(req.params.id);

  const item = await prisma.maintenance.findFirst({
    where: {
      maintenance_id: id,
      user_id: userId
    }
  });

  if (!item) {
    throw new AppError('Maintenance record not found', 404);
  }

  res.json(item);
});

export const searchMaintenanceByDescription = catchAsync(async (req: Request, res: Response) => {
  const userId = Number((req as any).user.userId);
  const { keyword } = req.query;

  if (!keyword) {
    throw new AppError('Search keyword is required', 400);
  }

  const data = await prisma.maintenance.findMany({
    where: {
      user_id: userId,
      description: { contains: String(keyword), mode: 'insensitive' }
    }
  });
  res.json(data);
});