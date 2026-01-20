import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const googleAuthCallback = (req: Request, res: Response) => {
  const user = req.user as any;
  const state = req.query.state as string;

  const token = jwt.sign(
    { userId: user.user_id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '12h' }
  );

  let targetUrl = state || process.env.DEFAULT_FRONTEND_URL;

  if (targetUrl && targetUrl.endsWith('/')) {
    targetUrl = targetUrl.slice(0, -1);
  }

  res.redirect(`${targetUrl}/login-success?token=${token}`);
};