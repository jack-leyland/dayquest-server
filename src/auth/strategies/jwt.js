import passport from "passport";
import { Strategy as JWTStrategy, ExtractJwt as ExtractJWT} from "passport-jwt";
import {default as UserModel} from '../../models/User.js';
import {default as config} from '../../config/index.js';

passport.use(
  new JWTStrategy(
    {
      secretOrKey: config.access_secret,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true
    },
    async (req, token, done) => {
      try {
        const userData = await UserModel.findOne({userId: token.user.userId, active: true}, "devices")
        if(!userData) {
          return done(null, false, {notFound: true})
        } else if (!userData.devices.includes(req.headers.device)) {
          return done(null, false, null)
        }
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);




