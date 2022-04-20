import { Router } from 'express'
import models from '../../models'
import runAsyncWrapper from '../../utils/runAsyncWrapper'
import requiresAuth from '../../middleware/requiresAuth'
import JWTUtils from '../../utils/jwt-utils'

const router = Router()
const { User, Role, sequelize } = models

router.put('/update', requiresAuth(), runAsyncWrapper(async (req, res) => {
  let { jwt, username, firstName, lastName, roles, password } = req.body

  await sequelize.transaction(async () => {
    const user = await User.findOne({ where: { email: jwt.email }, include: Role })
    const dataToUpdate = {}

    if (username && username !== user.username) {
      dataToUpdate.username = username
    }

    if (firstName && firstName !== user.firstName) {
      dataToUpdate.firstName = firstName
    }

    if (lastName && lastName !== user.lastName) {
      dataToUpdate.lastName = lastName
    }

    if (roles && Array.isArray(roles)) {
      let savedRoles = {}
      let userSavedRoles = await user.getRoles()
      userSavedRoles.map((role) => {
        !savedRoles[role.role] && (savedRoles[role.role] = true)
      })

      for (const role of roles) {
        !savedRoles[role] && await user.createRole({ role })
      }
    }

    // if(email){
    //   const accessToken = JWTUtils.generateAccessToken({email})
    //   const refreshToken = JWTUtils.generateRefreshToken({email})
    // }

    await user.update({ ...dataToUpdate })
  })

  res.status(200).send({ success: true, message: 'Successfully updated user' })
}))



export default router