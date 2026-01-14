import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const googleAuthCallback = (req: Request, res: Response) => {
  const user = req.user as any;
  
  const token = jwt.sign(
    { userId: user.user_id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '12h' }
  );

  res.redirect(`${process.env.FRONTEND_URL}/login-success?token=${token}`);
};