import { Router } from 'express';
import passport from 'passport';


const router = Router()

router.post('/',
    async (req, res, next) => {
      passport.authenticate(
        'local-register', 
        { session: false }, 
        async (err, user, info) => {
          if (err) {
            console.error(err)
            res.status(500).send("Server Error")
            return
          }
          if (!user && info ) {
            if (info.message === 'Missing credentials' || info.message === 'Missing fields') {
              res.status(400).json({
                success: false,
                message: `Missing registration fields`,
                user: null
              })
            } else {
              res.status(400).json({
                success: false,
                message: `${info.alreadyExists} exists`,
                user: null
              })
            }
          } else {
            res.json({
              success: true,
              message: 'Registration Sucessful',
              user: user,
              token: info.tokens.access,
              refresh: info.tokens.refresh
            })
          }
        }
    )(req, res, next);
});

export default router