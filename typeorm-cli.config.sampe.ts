import { DataSource } from 'typeorm';

module.exports = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'A12M11A2003R',
  database: 'social_app_db',
  synchronize: false,
  logging: true,
  entities: ['**/*.entity.js'],
  migrations: ['migrations/*.js'],
});
