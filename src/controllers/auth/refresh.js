import passport from 'passport';
import { hasDeviceHeader, refreshRequestisValid } from '../../auth/helpers.js';

export default async (req, res) => {

    if (!refreshRequestisValid(req)) {
        return res.status(400).json({
            message: "Bad Request. Missing fields."
        })
    } else if (!hasDeviceHeader(req)) {
        return res.status(400).json({ message: "Bad Request. Missing deviceId header." })
    }

    passport.authenticate(
        'refresh',
        { session: false },
        async (err, user, info) => {
            if (err) {
                console.error(err)
                res.status(500).send('Internal Server Error')
                return
            }
            if (info.invalid) {
                res.status(401).send()
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
