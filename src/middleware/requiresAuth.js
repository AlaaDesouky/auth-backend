import JWTUtils from '../utils/jwt-utils'

function requireAuth(tokenType = 'accessToken') {
  return function (req, res, next) {
    const authHeader = req.headers.authorization

    if (authHeader) {
      try {
        var [bearer, token] = authHeader.split(' ')
        if (bearer.toLowerCase() !== 'bearer' || !token) {
          throw Error
        }
      } catch (error) {
        return res.status(401).send({ success: false, message: 'Bearer token malformed' })
      }
    } else {
      return res.status(401).send({ success: false, message: 'Authorization header not found' })
    }

    try {
      let jwt
      switch (tokenType) {
        case 'refreshToken':
          jwt = JWTUtils.verifyRefreshToken(token)
          break;
        case 'accessToken':
        default:
          jwt = JWTUtils.verifyAccessToken(token)
      }

      req.body.jwt = jwt
      next()
    } catch (error) {
      return res.status(401).send({ success: false, message: 'Invalid token' })
    }
  }
}

export default requireAuth;