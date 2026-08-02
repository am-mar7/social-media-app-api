import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  enviroment: process.env.NODE_ENV || 'production',
  apiVersion: process.env.API_VERSION || '0.1.1',
  imageKitUrlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
  imageKitPublicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  imageKitPrivateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
}));
