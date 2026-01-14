import { Request, Response } from 'express';
import { prisma } from '../db';

export const getAllMaintenance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const data = await prisma.maintenance.findMany({
      where: { user_id: userId }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch maintenance' });
  }
};

export const createMaintenance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
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
  } catch (error) {
    res.status(400).json({ error: 'Error creating maintenance' });
  }
};

export const updateMaintenance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const item = await prisma.maintenance.update({
      where: { 
        maintenance_id: Number(req.params.id),
        user_id: userId
      },
      data: req.body
    });
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: 'Update failed or access denied' });
  }
};

export const deleteMaintenance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    await prisma.maintenance.delete({ 
      where: { 
        maintenance_id: Number(req.params.id),
        user_id: userId
      } 
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Delete failed or access denied' });
  }
};

export const getMaintenanceById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const item = await prisma.maintenance.findFirst({
      where: { 
        maintenance_id: Number(req.params.id),
        user_id: userId
      }
    });
    if (!item) return res.status(404).json({ error: 'Maintenance record not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const searchMaintenanceByDescription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { keyword } = req.query;
    const data = await prisma.maintenance.findMany({
      where: {
        user_id: userId,
        description: { contains: String(keyword), mode: 'insensitive' }
      }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
};