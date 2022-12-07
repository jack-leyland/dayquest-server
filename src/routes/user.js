import {Router} from 'express'
import { authenticateUserRoute } from '../controllers/user/autheticateUserRoute.js'
import { activeUserController } from '../controllers/user/retrieveUser.js'
import { deactivateUserController } from '../controllers/user/deactivate.js'
const router = Router()

router.use("/:userId", authenticateUserRoute)
router.get("/:userId", activeUserController)
router.delete("/:userId", deactivateUserController)

export default router