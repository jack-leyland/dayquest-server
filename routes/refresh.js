import { Router } from 'express';
import passport from 'passport';

const router = Router()

router.post('/',
    async (req, res, next) => {
        passport.authenticate(
            'refresh',
            {session: false},
            async (err, user, info) => {
                if (err) {
                    console.error(err)
                    res.status(500).send('Server Error')
                    return;
                    }
                try {
                    if (!user) {
                        res.status(400).json({success: false, message: info.message})
                        return 
                    }
                    res.json({
                        success: true, 
                        message: info.message,
                        access: info.tokens.access,
                        refresh: info.tokens.refresh
                    })
                } catch (error) {
                    return next(error)
                }
            }
        )(req, res, next)
    }
)

export default router