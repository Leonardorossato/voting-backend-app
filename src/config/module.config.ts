import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from 'src/redis/redis.module';

export const redisModule = RedisModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (config: ConfigService) => {
    const logger = new Logger('RedisModule');

    return {
      connectionOptions: {
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
      },
      onClientReady(client) {
        logger.log('Redis client ready');

        client.on('error', (err) => {
          logger.error('Redis client error : ' + err);
        });

        client.on('connect', () => {
          `Connected to redis server : ${client.options.host}:${client.options.port}`;
        });
      },
    };
  },
  inject: [ConfigService],
});

export const jwtModule = JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (config: ConfigService) => ({
    secret: config.get<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: '1h',
    },
  }),
  inject: [ConfigService],
});
