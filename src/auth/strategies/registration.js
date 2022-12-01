import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import {default as UserModel} from '../../models/User.js';
import {v4 as uuid} from 'uuid';
import {default as RefreshTokenModel} from '../../models/RefreshTokens.js';
import { generateTokens} from "../helpers.js";


passport.use(
    'local-register',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        session: false,
        passReqToCallback: true
      },
      async (req, email, password, done) => {
        try {
          const emailExists = await UserModel.findOne({email: email})
          if (emailExists) {
            return done(null, false, {alreadyExists: 'email'})
          }

          const usernameExists = await UserModel.findOne({username: req.body.username})
          if (usernameExists) {
            return done(null, false, {alreadyExists: 'username'})
          }
          
          const userId = uuid()
          const body = { userId: userId, username: req.body.username};
          const tokens = generateTokens(body, false)

          const user = await UserModel.create(
            { 
              userId: userId,
              email: email, 
              password: password, 
              username: req.body.username, 
              devices: [req.headers.device],
            });

          await RefreshTokenModel.create(
            {
              userId: userId,
              deviceId: req.headers.device,
              token: tokens.refresh
          })
          
          const userInfoForClient = {email: user.email, username: user.username, userId:user.userId}
          return done(null, userInfoForClient, {tokens: tokens});

        } catch (error) {
          done(error);
        }
      }
    )
);