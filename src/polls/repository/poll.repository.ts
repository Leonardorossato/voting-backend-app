import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Command, Redis } from 'ioredis';
import { IORedisKey } from 'src/redis/redis.module';
import { Poll } from 'src/shared';
import { AddParticipantData, CreatePollData } from 'src/types/types';

@Injectable()
export class PollRepository {
  private readonly tll: number;
  private readonly logger = new Logger(PollRepository.name);

  constructor(
    config: ConfigService,
    @Inject(IORedisKey) private readonly redisClient: Redis
  ) {
    this.tll = config.get('POLL_DURATION');
  }

  async createPoll({
    votesPerVoter,
    topic,
    pollId,
    userId,
  }: CreatePollData): Promise<Poll> {
    const initialPoll = {
      id: pollId,
      topic,
      votesPerVoter,
      participants: {},
      adminId: userId,
    };

    this.logger.log(
      `Creating new poll ${JSON.stringify(initialPoll, null, 2)} with TLL :  ${
        this.tll
      }`,
    );

    const key = `polls: ${pollId}`;

    try {
      await this.redisClient
        .multi([
          ['send_command', 'JSON.SER', key, '.', JSON.stringify(initialPoll)],
          ['expires', key, this.tll],
        ])
        .exec();
      return initialPoll;
    } catch (error) {
      this.logger.error(
        `Failed to create poll ${JSON.stringify(initialPoll)}\n${error}`,
      );
      throw new HttpException(
        'Error in redis',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPoll(pollId: string): Promise<Poll> {
    this.logger.log(`Attempting to get poll with: ${pollId}`);
    const key = `poll: ${pollId}`;

    try {
      const command: Command = new Command('JSON.GET', [key, '-']);
      const currentPoll = await this.redisClient.sendCommand(command);
      this.logger.verbose(currentPoll as string);
      return JSON.parse(currentPoll as string);
    } catch (error) {
      this.logger.error(`Error to get poll with: ${pollId}`);
      throw error;
    }
  }

  async addParticipant({
    pollId,
    userId,
    name,
  }: AddParticipantData): Promise<Poll> {
    this.logger.log(
      `Attempting to add a participant with userId/name: ${userId}/${name} to poll ${pollId}`,
    );

    const key = `polls:${pollId}`;
    const participantPath = `.participants.${userId}`;

    try {
      const command1: Command = new Command('JSON.SET', [
        key,
        participantPath,
        JSON.stringify(name),
      ]);
      const command2: Command = new Command('JSON.GET', [key, '-']);
      const currentPoll = await this.redisClient.sendCommand(command1);
      const sendPoll = await this.redisClient.sendCommand(command2);
      this.logger.verbose(currentPoll as string);
      const pull = JSON.parse(sendPoll as string) as Poll;
      return pull;
    } catch (error) {
      this.logger.error(
        `Error failed to add participant with userId/name: ${userId}/${name}`,
      );
      throw error;
    }
  }
}
