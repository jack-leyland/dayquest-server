import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import {default as UserModel} from '../../models/User.js';
import {v4 as uuid} from 'uuid';
import {default as RefreshTokenModel} from '../../models/RefreshTokens.js';
import { generateTokens} from "../helpers.js";
import {postgresQuery} from "../../db/index.js"


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
          const emailInUse= await UserModel.findOne({email: email, active: true})
          if (emailInUse) {
            return done(null, false, {alreadyExists: 'email'})
          }

          const usernameInUse = await UserModel.findOne({username: req.body.username, active: true})
          if (usernameInUse) {
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
              active: true
            });

          await RefreshTokenModel.create(
            {
              userId: userId,
              deviceId: req.headers.device,
              token: tokens.refresh
          })

          await postgresQuery(`INSERT INTO users("userId", username, email, active)
                                VALUES ($1, $2, $3, $4)`, [userId, req.body.username, email, 1])
          
          const userInfoForClient = {email: user.email, username: user.username, userId:user.userId}
          return done(null, userInfoForClient, {tokens: tokens});

        } catch (error) {
          done(error);
        }
      }
    )
);