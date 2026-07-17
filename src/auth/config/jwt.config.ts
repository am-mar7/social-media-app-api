import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  issuer: process.env.JWT_TOKEN_ISSUER,
  secret: process.env.JWT_SECRET,
  audience: process.env.JWT_TOKEN_AUDIENCE,
  accessTokenTtl: Number(process.env.JWT_ACCESS_TOKEN_TTL),
}));
