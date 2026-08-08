import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  name: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  port: Number(process.env.DATABASE_PORT) || 5432,
  host: process.env.DATABASE_HOST || 'localhost',
  autoLoadEntities: process.env.NODE_ENV === 'development' ? true : false,
  synchronize: process.env.NODE_ENV === 'development' ? true : false,
}));
