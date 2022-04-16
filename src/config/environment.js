const environment = {
  port: parseInt(process.env.PORT) || 8080,
  nodeEnv: process.env.NODE_ENV || 'production',
  saltRounds: parseInt(process.env.SALT_ROUNDS) || 10,
  jwtAccessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || '89689f9ca17e71afaca5ed19bc8c7b3a60afbf29a9360007f76b2d7651e89b919f5755e3bc81349f159e3269b7ced7929693f99633017f64b130774f01f512ed',
  jwtRefreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || 'dc6df56c0b927f7192345fc799f3221393e072a3811bcc433f9d204b11384355370e5393e91d732c826c559ef57fc73ec3cf4ba3c150f77d579c33b1d4d4ad8c'
}

export default environment;