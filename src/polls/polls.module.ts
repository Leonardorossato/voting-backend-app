import { Module } from '@nestjs/common';
import { PollsService } from './polls.service';
import { PollsController } from './polls.controller';
import { RedisModule } from '../redis/redis.module';
import { PollRepository } from './repository/poll.repository';
import { ConfigModule } from '@nestjs/config';
import { redisModule } from 'src/config/module.config';

@Module({
  imports: [RedisModule, redisModule],
  controllers: [PollsController],
  providers: [PollsService, PollRepository],
})
export class PollsModule {}
