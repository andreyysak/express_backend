import { Request, Response } from 'express';
import { prisma } from '../db';

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        email: true,
        telegram_name: true,
        image: true,
        country: true,
        city: true,
        created_at: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateUserCity = async (req: Request, res: Response) => {
  try {
    const userId = Number((req as any).user.userId);
    const { city } = req.body;

    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: { city }
    });

    res.json({ message: 'City updated successfully', city: updatedUser.city });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update city' });
  }
};