import passport from 'passport';
import { loginRequestisValid, hasDeviceHeader } from '../../auth/helpers.js';

export default async (req, res) => {
    if (!loginRequestisValid(req)) {
        return res.status(400).json({
            message: "Bad request. Missing login fields."
        })
    } else if (!hasDeviceHeader(req)) {
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
            } else {
                res.json({
                    success: true,
                    access: info.tokens.access,
                    refresh: info.tokens.refresh,
                })
            }


        }
    )(req, res)
}