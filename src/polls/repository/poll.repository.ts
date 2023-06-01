import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { IORedisKey } from 'src/redis/redis.module';

@Injectable()
export class PollRepository {
  private readonly tll: number;
  private readonly logger = new Logger(PollRepository.name);

  constructor(
    config: ConfigService,
    @Inject(IORedisKey) private readonly redisClient: Redis,
  ) {
    this.tll = process.env.POOL_DURATION;
  }
}
