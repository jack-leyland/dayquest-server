import passport from "passport";
import { Strategy as JWTStrategy, ExtractJwt as ExtractJWT} from "passport-jwt";
import {default as UserModel} from '../../models/User.js';
import {default as RefreshTokenModel} from '../../models/RefreshTokens.js';
import {generateTokens} from "../helpers.js";
import {default as config} from '../../config/index.js';
import jwt from 'jsonwebtoken';

passport.use(
    'refresh',
    new JWTStrategy(
      {
        secretOrKey: config.refresh_secret,
        jwtFromRequest: ExtractJWT.fromBodyField('refresh_token'),
        passReqToCallback: true
      },
      async (req, token, done) => {
        try {
          // bad token doesn't make it here
  
          const userData = await UserModel.findOne({userId: token.user.userId}, "devices")
          if (!userData.devices.includes(req.headers.device)) {
            return done(false, false, {message: "Unrecognized user device."})
          }
  
          // Check it exists in records
          const record = await RefreshTokenModel.findOne({userId: token.user.userId, deviceId: req.headers.device})
          const match = await record.isMatch(req.body.refresh_token)
          if(!record || !match) {
            return done(false, false, {message:"Invalid refresh token."})
          }
  
          const body = { userId: token.user.userId, username: token.user.username};
          const tokens = {
            access: generateTokens(body, true),
            refresh: jwt.sign({user: body}, config.refresh_secret, {expiresIn: token.exp})
          }
  
          record.token = tokens.refresh
          await record.save()
  
          return done(null, token.user, {tokens: tokens});
        } catch (error) {
          done(error);
        }
      }
    )
  );