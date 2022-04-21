import { Router } from 'express'
import models from '../../models'
import runAsyncWrapper from '../../utils/runAsyncWrapper'
import requiresAuth from '../../middleware/requiresAuth'

const router = Router()
const { User, Role } = models

router.get('/info', requiresAuth(), runAsyncWrapper(async (req, res) => {
  const { jwt } = req.body
  const { email, username, firstName, lastName, Roles } = await User.findOne({ where: { email: jwt.email }, include: Role })
  const data = {
    email,
    username,
    firstName,
    lastName,
    roles: Roles && Roles.map((role) => (role.role))
  }
  res.status(200).send({ success: true, data })
}))


export default router