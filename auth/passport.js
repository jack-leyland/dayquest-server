import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt as ExtractJWT} from "passport-jwt";
import {default as UserModel} from '../models/User.js';
import {v4 as uuid} from 'uuid';
import {default as LoginModel} from '../models/Logins.js';
import {default as RefreshTokenModel} from '../models/RefreshTokens.js';
import {regRequestisValid, generateTokens} from "./helpers.js";
import {default as config} from '../config/index.js';
import jwt from 'jsonwebtoken';

// This contain definitions for all the passport middleware used for Authentication

// All passport local auth strategies will only return a user object when auth is successful
// If user is authenticated, the auth tokens will be returned to the router in the "info" argument

// Unlike many online examples, token generation for logins happens here, not in req.login(), which is not defined in this 
// implementation

// Note that a login issues a refresh token with 30 day expiration no matter what. It is expected this won't happen often.

// However, during regular periodic renewal of access tokens, new refresh tokens issued will inherit
// the old token's ttl, meaning users will have to log in every 30 days not matter what.

// To revoke a refresh token for a given user and device, simply delete it from that collection.

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
        if (!regRequestisValid(req.body)) {
          return done(null, false, {message: "Missing fields"})
        }
        try {
          const emailExists = await UserModel.findOne({email: email})
          if (emailExists) {
            return done(null, false, {message: '', alreadyExists: 'email'})
          }

          const usernameExists = await UserModel.findOne({username: req.body.username})
          if (usernameExists) {
            return done(null, false, {message: '', alreadyExists: 'username'})
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

// Adds device if unrecognized
// All requests while logged in will need to have a recognized deviceId 
// and a valid Token in order to be authenticated.

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
          let user = await UserModel.findOne({ email: id });
          if (!user) {
            user = await UserModel.findOne({ username: id });
          }
          if (!user) {
            return done(null, false, { message: 'No matching account found.', badField: "id" });
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
          return done(null, userInfoForClient, { message: 'Login Success', tokens: tokens });

        } catch (error) {
          return done(error);
        }
      }
    )
);
  
  // Verifies deviceId is recognized as well.
  // If token is valid but device is not recognized, must prompt for login.
  // This routing is handled in the client since any request that 
  // fails here won't have a login payload

passport.use(
  new JWTStrategy(
    {
      secretOrKey: config.access_secret,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true
    },
    async (req, token, done) => {
      try {
        const userData = await UserModel.findOne({userId: token.user.userId}, "devices")
        if (!userData.devices.includes(req.headers.device)) {
          return done(null, false, {message: "unrecognized user device"})
        }
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);

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
        if (!Object.hasOwn(req.headers,'device')) {
          return done(null, false, {message: "missing device id"})
        }

        const userData = await UserModel.findOne({userId: token.user.userId}, "devices")
        if (!userData.devices.includes(req.headers.device)) {
          return done(null, false, {message: "unrecognized user device"})
        }

        // Check it exists in records
        const record = await RefreshTokenModel.findOne({userId: token.user.userId, deviceId: req.headers.device})
        const match = await record.isMatch(req.body.refresh_token)
        if(!record || !match) {
          return done(null, false, {message:"bad token"})
        }

        const body = { userId: token.user.userId, username: token.user.username};
        const tokens = {
          access: generateTokens(body, true),
          refresh: jwt.sign({user: body}, config.refresh_secret, {expiresIn: token.exp})
        }

        record.token = tokens.refresh
        await record.save()

        return done(null, token.user, {message: "refresh access success", tokens: tokens});
      } catch (error) {
        done(error);
      }
    }
  )
);


