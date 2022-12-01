import passport from 'passport';
import { loginRequestisValid } from '../../auth/helpers.js';

export default async (req, res) => {
    if (!loginRequestisValid(req)) {
        return res.status(400).json({
            message: "Bad request. Missing login fields."
        })
    } else if (!Object.hasOwn(req.headers, "device")) {
        return res.status(400).json({
            message: "Bad request. Missing device header."
        })
    }

    passport.authenticate(
        'login',
        { session: false },
        async (err, user, info) => {
            if (err) {
                console.error(err)
                res.status(500).send('Internal Server Error')
                return
            }
            if (!user) {
                res.json({
                    success: false, 
                    message: info.message, 
                    badField: info.badField
                })
            }

            res.json({
                success: true,
                access: info.tokens.access,
                refresh: info.tokens.refresh,
            })
        }
    )(req,res)
}