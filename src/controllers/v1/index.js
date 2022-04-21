import { Router } from 'express'
import registerRouter from './register'
import loginRouter from './login'
import tokenRouter from './token'
import logoutRouter from './logout'
import updateRouter from './update'
import deleteRouter from './delete'
import infoRouter from './info'

const router = Router()
router.use(registerRouter)
router.use(loginRouter)
router.use(tokenRouter)
router.use(logoutRouter)
router.use(updateRouter)
router.use(deleteRouter)
router.use(infoRouter)

export default router