import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = Router()

router.post(
    '/register',
    passport.authenticate('register', { session: false }),
    async (req, res, next) => {
      res.json({
        message: 'Registration successful',
        user: req.user
      });
    }
  );