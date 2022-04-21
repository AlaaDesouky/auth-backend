import { Router } from 'express'
import models from '../../models'
import runAsyncWrapper from '../../utils/runAsyncWrapper'
import requiresAuth from '../../middleware/requiresAuth'

const router = Router()
const { User } = models

router.put('/update', requiresAuth(), runAsyncWrapper(async (req, res) => {
  let { jwt, username, firstName, lastName, roles, password } = req.body

  const user = await User.scope('withPassword').findOne({ where: { email: jwt.email } })
  const dataToUpdate = { userInformationData: {}, userAuthorizationData: {} }

  if (username && username !== user.username) {
    dataToUpdate.userInformationData.username = username
  }

  if (firstName && firstName !== user.firstName) {
    dataToUpdate.userInformationData.firstName = firstName
  }

  if (lastName && lastName !== user.lastName) {
    dataToUpdate.userInformationData.lastName = lastName
  }

  if (roles && Array.isArray(roles)) {
    dataToUpdate.userAuthorizationData.roles = roles
  }

  if (password && !(await user.comparePassword(password))) {
    dataToUpdate.userAuthorizationData.password = password
  }

  await user.updateUser(dataToUpdate)
  res.status(200).send({ success: true, message: 'Successfully updated user' })
}))



export default router