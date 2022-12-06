import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import {default as UserModel} from '../../models/User.js';
import {default as LoginModel} from '../../models/Logins.js';
import {default as RefreshTokenModel} from '../../models/RefreshTokens.js';
import {generateTokens} from "../helpers.js";

passport.use(
    'login',
    new LocalStrategy(
      {
        usernameField: 'id',
        passwordField: 'password',
        session: false,
        passReqToCallback: true,
      },
      async (req, id, password, done) => {
        try {
          let user = await UserModel.findOne({ email: id, active: true});
          if (!user) {
            user = await UserModel.findOne({ username: id, active: true });
          }
          if (!user) {
            return done(null, false, { message: 'No matching account found', badField: "id" });
          }
  
          const pwdValid = await user.isValidPassword(password);
          const deviceRecognized = user.devices.includes(req.headers.device)
          const body = { userId: user.userId, username: user.username};
          const tokens = generateTokens(body, false)

          if (!pwdValid) {
            await LoginModel.create({
              userId: user.userId,
              device: req.headers.device,
              deviceRecognized: deviceRecognized,
              successful: false
            }) 
            return done(null, false, { message: 'Invalid Password', badField: "password" });
          }

          //New device login
          if (!deviceRecognized) {
            user.devices.push(req.headers.device)
            await user.save()
            await RefreshTokenModel.create({
              userId: user.userId,
              deviceId: req.headers.device,
              token: tokens.refresh
            })
          } else {
            let tokenRecord = await RefreshTokenModel.findOne({userId: user.userId, deviceId: req.headers.device})
            tokenRecord.token = tokens.refresh
            await tokenRecord.save()
          }
          
          await LoginModel.create({
            userId: user.userId,
            device: req.headers.device,
            deviceRecognized: deviceRecognized,
            successful: true
          })

          const userInfoForClient = {email: user.email, username: user.username, userId:user.userId}
          return done(null, userInfoForClient, { tokens: tokens });

        } catch (error) {
          return done(error);
        }
      }
    )
);