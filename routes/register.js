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
                alreadyExists: null,
                user: null,
                token: null,
                refresh: null
              })
            } else {
              res.json({
                success: false,
                message: null,
                alreadyExists: info.alreadyExists,
                user: null,
                token: null,
                refresh: null
              })
            }
          } else {
            res.json({
              success: true,
              message: 'Registration Sucessful',
              alreadyExists: null,
              user: user,
              token: info.tokens.access,
              refresh: info.tokens.refresh
            })
          }
        }
    )(req, res, next);
});

export default router