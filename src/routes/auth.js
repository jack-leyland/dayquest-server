import {Router} from 'express'
import registrationController from '../controllers/auth/register.js'
import loginController from '../controllers/auth/login.js'
import refreshController from '../controllers/auth/refresh.js'

const router = Router()

router.post('/register', registrationController)
router.post('/login', loginController)
router.post('/refresh', refreshController)

export default router