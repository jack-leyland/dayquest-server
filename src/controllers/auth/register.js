import passport from 'passport';
import { regRequestisValid } from '../../auth/helpers.js';

export default async (req, res) => {

  if (!regRequestisValid(req)) {
    return res.status(400).json(
      {message: "Bad Request. Missing registation fields."}
    )
  } else if (!Object.hasOwn(req.headers, "device")) {
    return res.status(400).json(
      {message: "Bad Request. Missing device header."}
    )
  }

    passport.authenticate(
      'local-register', 
      { session: false }, 
      async (err, user, info) => {
        
        if (err) {
          console.error(err)
          res.status(500).send("Internal Server Error")
          return
        }

        if (info.alreadyExists) {
          res.json({
            success: false,
            alreadyExists: info.alreadyExists,
          })
        } else {
          res.json({
            success: true,
            user: user,
            token: info.tokens.access,
            refresh: info.tokens.refresh
          })
        }
      }
  )(req,res)
}

