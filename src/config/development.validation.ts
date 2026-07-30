import Joi from 'joi';

const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  DATABASE_URL: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_PORT: Joi.number().required().default(5432),
  JWT_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_TTL: Joi.string().required(),
  JWT_REFRESH_TOKEN_TTL: Joi.string().required(),
  JWT_TOKEN_ISSUER: Joi.string().required(),
  JWT_TOKEN_AUDIENCE: Joi.string().required(),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  API_VERSION: Joi.string().required(),
});

export default validationSchema;
