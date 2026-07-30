import { registerAs } from '@nestjs/config';


export default registerAs('app', () => ({
  enviroment: process.env.NODE_ENV || 'production',
  apiVersion: process.env.API_VERSION || '0.1.1',
}));

