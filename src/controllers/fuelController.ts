import { Request, Response } from 'express';
import { prisma } from '../db';

export const getAllFuel = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const data = await prisma.fuel.findMany({
      where: { user_id: userId }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fuel data' });
  }
};

export const createFuel = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
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
  } catch (error) {
    res.status(400).json({ error: 'Error creating fuel record' });
  }
};

export const updateFuel = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const item = await prisma.fuel.update({
      where: { 
        gas_id: Number(req.params.id),
        user_id: userId 
      },
      data: req.body
    });
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: 'Update failed or access denied' });
  }
};

export const deleteFuel = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    await prisma.fuel.delete({ 
      where: { 
        gas_id: Number(req.params.id),
        user_id: userId 
      } 
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Delete failed or access denied' });
  }
};

export const getFuelById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const item = await prisma.fuel.findFirst({
      where: { 
        gas_id: Number(req.params.id),
        user_id: userId 
      }
    });
    if (!item) return res.status(404).json({ error: 'Record not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const searchFuelByStation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { station } = req.query;
    const data = await prisma.fuel.findMany({
      where: {
        user_id: userId,
        station: { contains: String(station), mode: 'insensitive' }
      }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
};