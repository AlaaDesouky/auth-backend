import { Router } from 'express'
import models from '../../models'
import JWTUtils from '../../utils/jwt-utils'
import runAsyncWrapper from '../../utils/runAsyncWrapper'

const router = Router()
const { User, Role, sequelize } = models

router.post('/register', runAsyncWrapper(async (req, res) => {
  const { email, password, roles } = req.body
  // Check if user exists
  const user = await User.findOne({ where: { email } })
  if (user) {
    return res.status(200).send({ success: false, message: 'User already exists' })
  }

  // Create new user
  const result = await sequelize.transaction(async () => {
    const newUser = await User.create({ email, password })
    // Generate jwt tokens
    const jwtPayload = { email }
    const accessToken = JWTUtils.generateAccessToken(jwtPayload)
    const refreshToken = JWTUtils.generateRefreshToken(jwtPayload)
    // Create refresh token model, -- a mixin provided by sequelize when two models are associated --
    await newUser.createRefreshToken({ token: refreshToken })

    // Create and associate roles
    if (roles && Array.isArray(roles)) {
      const rolesToSave = []
      // -- 'for of loop' awaits for an array of promises --
      for (const role of roles) {
        const newRole = await Role.create({ role })
        rolesToSave.push(newRole)
      }
      // -- a mixin provided by sequelize --
      await newUser.addRoles(rolesToSave)
    }

    return { accessToken, refreshToken }
  })
  const { accessToken, refreshToken } = result

  return res.status(201).send({
    success: true,
    message: 'User successfully registered',
    data: {
      accessToken,
      refreshToken
    }
  })
}))

export default router