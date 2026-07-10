import { registerAs } from '@nestjs/config';


export default registerAs('app', () => ({
  enviroment: process.env.NODE_ENV || 'production',
}));

