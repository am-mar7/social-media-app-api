import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  issuer: process.env.JWT_TOKEN_ISSUER,
  secret: process.env.JWT_SECRET,
  audience: process.env.JWT_TOKEN_AUDIENCE,
  accessTokenTtl: Number(process.env.JWT_ACCESS_TOKEN_TTL),
  refreshTokenTtl: Number(process.env.JWT_REFRESH_TOKEN_TTL),
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
}));
