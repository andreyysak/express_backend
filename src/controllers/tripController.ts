import { Request, Response } from 'express';
import { prisma } from '../db';

export const getAllTrips = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    const data = await prisma.trip.findMany({
      where: { telegram_user_id: user.telegram_user_id }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
};

export const createTrip = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { kilometrs, direction } = req.body;
    const item = await prisma.trip.create({
      data: { 
        telegram_user_id: user.telegram_user_id, 
        kilometrs, 
        direction 
      }
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: 'Error creating trip' });
  }
};

export const updateTrip = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    
    const item = await prisma.trip.update({
      where: { 
        trip_id: Number(req.params.id),
        telegram_user_id: user?.telegram_user_id 
      },
      data: req.body
    });
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: 'Update failed or access denied' });
  }
};

export const deleteTrip = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({ where: { user_id: userId } });

    await prisma.trip.delete({ 
      where: { 
        trip_id: Number(req.params.id),
        telegram_user_id: user?.telegram_user_id 
      } 
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Delete failed or access denied' });
  }
};

export const getTripById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({ where: { user_id: userId } });

    const item = await prisma.trip.findFirst({
      where: { 
        trip_id: Number(req.params.id),
        telegram_user_id: user?.telegram_user_id 
      }
    });
    if (!item) return res.status(404).json({ error: 'Trip not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTripsByDirection = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    const { query } = req.query;

    const data = await prisma.trip.findMany({
      where: {
        telegram_user_id: user?.telegram_user_id,
        direction: { contains: String(query), mode: 'insensitive' }
      }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
};