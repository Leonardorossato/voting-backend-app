import { Module } from '@nestjs/common';
import { jwtModule, redisModule } from 'src/config/module.config';
import { RedisModule } from '../redis/redis.module';
import { PollsController } from './polls.controller';
import { PollsGateway } from './polls.gateway';
import { PollsService } from './polls.service';
import { PollRepository } from './repository/poll.repository';

@Module({
  imports: [RedisModule, redisModule, jwtModule],
  controllers: [PollsController],
  providers: [PollsService, PollRepository, PollsGateway],
})
export class PollsModule {}
