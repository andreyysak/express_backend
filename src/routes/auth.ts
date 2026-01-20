import { Router } from 'express';
import passport from 'passport';
import { googleAuthCallback } from '../controllers/authController';

const router = Router();

router.get('/google', (req, res, next) => {
    const frontendUrl = req.query.frontendUrl as string;

    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: frontendUrl
    })(req, res, next);
});

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    googleAuthCallback
);

export default router;