import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PollsModule } from './polls/polls.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PollsModule, RedisModule],
})
export class AppModule {}
