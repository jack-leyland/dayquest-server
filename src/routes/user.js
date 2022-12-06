import {Router} from 'express'
import { activeUserController } from '../controllers/user/active.js'
const router = Router()

router.get("/:userId", activeUserController)

export default router