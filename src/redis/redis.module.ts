import {
  DynamicModule,
  FactoryProvider,
  Module,
  ModuleMetadata,
} from '@nestjs/common';
import IORedis, { RedisOptions, Redis } from 'ioredis';

export const IORedisKey = 'IORedisKey';

type RedisModuleOptions = {
  connectionOptions: RedisOptions;
  onClientReady?: (client: Redis) => void;
};

type RedisAsyncModuleOptions = {
  usefactory: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;

@Module({})
export class RedisModule {
  static async registerAsync({
    usefactory,
    imports,
    inject,
  }: RedisAsyncModuleOptions): Promise<DynamicModule> {
    const redisProvider = {
      provide: IORedisKey,
      usefactory: async (...args) => {
        const { connectionOptions, onClientReady } = await usefactory(...args);
        const client = new IORedis(connectionOptions);
        onClientReady(client);
        return client;
      },
      inject,
    };
    return {
      module: RedisModule,
      imports,
      providers: [],
      exports: [],
    };
  }
}
