import { Router } from 'express'
import models from '../../models'
import JWTUtils from '../../utils/jwt-utils'
import runAsyncWrapper from '../../utils/runAsyncWrapper'

const router = Router()
const { User, RefreshToken } = models

router.post('/login', runAsyncWrapper(async (req, res) => {
  const { email, password } = req.body
  const user = await User.scope('withPassword').findOne({ where: { email } })

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).send({ success: false, message: 'Invalid credentials' })
  }

  const jwtPayload = { email }
  const accessToken = JWTUtils.generateAccessToken(jwtPayload)
  const savedRefreshToken = await user.getRefreshToken()

  let refreshToken

  if (!savedRefreshToken || !savedRefreshToken.token) {
    refreshToken = JWTUtils.generateRefreshToken({ jwtPayload })

    if (!savedRefreshToken) {
      await user.createRefreshToken({ token: refreshToken })
    } else {
      savedRefreshToken.token = refreshToken
      await savedRefreshToken.save()
    }
  } else {
    refreshToken = savedRefreshToken.token
  }

  return res.status(200).send({ success: true, message: 'Successfully logged in', data: { accessToken, refreshToken } })
}))

export default router