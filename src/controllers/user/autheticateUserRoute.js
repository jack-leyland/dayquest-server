import passport from 'passport';
import { hasDeviceHeader } from "../../auth/helpers.js";
// For a valid user request, client must supply a valid access token that corresponds to the id used in the route, 
// the user must exist and the device header must match a recognized device for that user.

export const authenticateUserRoute = async (req, res, next) => {
  if (!hasDeviceHeader(req)) {
    return res.status(400).json(
      { message: "Bad Request. Missing device header." }
    )
  }
  passport.authenticate(
    'jwt',
    { session: false },
    async (err, user, info) => {
      if (err) {
        console.error(err)
        res.status(500).send('Internal Server Error')
      }
      if (!user && info.notFound) {
        res.status(404).send()
      } else if (!user) {
        res.status(401).send()
      } else if (user.userId !== req.params.userId) {
        res.status(403).send()
      } else {
        req.user = user
        return next()
      }
      
    }
  )(req, res, next);
} 