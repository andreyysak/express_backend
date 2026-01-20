import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../db';

passport.use(
    new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          callbackURL: 'http://localhost:3000/api/auth/google/callback',
          passReqToCallback: true
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0].value;
            if (!email) return done(null, false);

            let user = await prisma.user.findUnique({
              where: { email },
            });

            if (!user) {
              user = await prisma.user.create({
                data: {
                  email,
                  telegram_name: profile.displayName,
                  image: profile.photos?.[0].value,
                  telegram_user_id: `google_${profile.id}`,
                },
              });
            }
            return done(null, user);
          } catch (error) {
            return done(error as Error, undefined);
          }
        },
    ),
);