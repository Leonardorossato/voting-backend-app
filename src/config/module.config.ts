import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
