import passport from 'passport';
import { refreshRequestisValid } from '../../auth/helpers.js';

export default async (req, res) => {

    if (!refreshRequestisValid(req)) {
        return res.status(400).json({
            message: "Bad Request. Missing fields."
        })
    } else if (!Object.hasOwn(req.headers,'device')) {
        return done(false, false, {message: "Bad Request. Missing deviceId header."})
      }

    passport.authenticate(
        'refresh',
        {session: false},
        async (err, user, info) => {
            if (err) {
                console.error(err)
                res.status(500).send('Internal Server Error')
                return
            }
            if (info.message) {
                res.json({success: false, message: info.message})
                return
            } else {
                res.json({
                    success: true, 
                    access: info.tokens.access,
                    refresh: info.tokens.refresh
                })
            }
        }
    )(req, res)
}
