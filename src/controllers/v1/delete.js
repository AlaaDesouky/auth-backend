import { Router } from 'express'
import models from '../../models'
import runAsyncWrapper from '../../utils/runAsyncWrapper'
import requiresAuth from '../../middleware/requiresAuth'

const router = Router()
const { User } = models

router.delete('/delete', requiresAuth(), runAsyncWrapper(async (req, res) => {
  const { jwt } = req.body
  const user = await User.findOne({ where: { email: jwt.email } })
  await user.deleteUser()

  res.status(200).send({ success: true, message: 'Successfully deleted user' })
}))


export default router
