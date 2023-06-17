import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Command, Redis } from 'ioredis';
import { IORedisKey } from 'src/redis/redis.module';
import { Poll, Results } from 'src/shared';
import {
  AddNominationData,
  AddParticipantData,
  AddParticipantRankingsData,
  CreatePollData,
} from 'src/types/types';

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
      nominations: {},
      rankings: {},
      results: [],
      adminId: userId,
      hasStarted: false,
    };

    this.logger.log(
      `Creating new poll ${JSON.stringify(initialPoll, null, 2)} with TLL: ${
        this.tll
      }`,
    );

    const key = `polls: ${pollId}`;

    try {
      await this.redisClient
        .multi([
          ['send_command', 'JSON.SET', key, '.', JSON.stringify(initialPoll)],
          ['expire', key, this.tll],
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
    const key = `polls: ${pollId}`;

    try {
      const command: Command = new Command('JSON.GET', [key, '-']);
      const currentPoll = await this.redisClient.sendCommand(command);
      const result = currentPoll as string;
      this.logger.verbose(result);
      return JSON.parse(result);
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

  async removeParticipant(pollID: string, userID: string): Promise<Poll> {
    this.logger.log(`removing userID: ${userID} from poll: ${pollID}`);

    const key = `polls:${pollID}`;
    const participantPath = `.participants.${userID}`;

    try {
      const command: Command = new Command('JSON.DEL', [
        key,
        '-',
        participantPath,
      ]);
      const currentPoll = await this.redisClient.sendCommand(command);
      const result = currentPoll as string;
      return this.getPoll(result);
    } catch (e) {
      this.logger.error(
        `Failed to remove userID: ${userID} from poll: ${pollID}`,
        e,
      );
      throw new InternalServerErrorException('Failed to remove participant');
    }
  }

  async addNomination({
    pollId,
    nominationId,
    nomination,
  }: AddNominationData): Promise<Poll> {
    this.logger.log(
      `Attempting to add a nomination with nominationId/nomination: ${nominationId}/${nomination.text} to pollId: ${pollId}`,
    );

    const key = `polls:${pollId}`;
    const nominationPath = `.nominations.${nominationId}`;

    try {
      const command: Command = new Command('JSON.SET', [
        key,
        JSON.stringify(nomination),
        nominationPath,
      ]);
      const currentPoll = await this.redisClient.sendCommand(command);
      const result = currentPoll as string;
      return this.getPoll(result);
    } catch (e) {
      this.logger.error(
        `Failed to add a nomination with nominationId/text: ${nominationId}/${nomination.text} to pollId: ${pollId}`,
        e,
      );
      throw new InternalServerErrorException('Failed to remove a nomination');
    }
  }

  async removeNomination(pollId: string, nominationId: string): Promise<Poll> {
    this.logger.log(
      `Attempting to add a nomination with nominationId: ${nominationId} to pollId: ${pollId}`,
    );

    const key = `polls:${pollId}`;
    const nominationPath = `.nominations.${nominationId}`;

    try {
      const command: Command = new Command('JSON.DEL', [key, nominationPath]);
      const currentPoll = await this.redisClient.sendCommand(command);
      const result = currentPoll as string;
      return this.getPoll(result);
    } catch (e) {
      this.logger.error(
        `Failed to remove a nomination with nominationId: ${nominationId} to pollId: ${pollId}`,
        e,
      );
      throw new InternalServerErrorException('Failed to remove a nomination');
    }
  }

  async startPoll(pollId: string): Promise<Poll> {
    try {
      this.logger.log(`Setting hasStarted for pollId: ${pollId}`);
      const key = `polls: ${pollId}`;
      const command: Command = new Command('JSON.SET', [
        key,
        'hasStarted',
        JSON.stringify(true),
      ]);
      const currentPoll = await this.redisClient.sendCommand(command);
      const result = currentPoll as string;
      return this.getPoll(result);
    } catch (error) {
      throw new Error('Error to start this poll');
    }
  }

  async addParticipantRankings({
    pollId,
    userId,
    rankings,
  }: AddParticipantRankingsData): Promise<Poll> {
    try {
      this.logger.log(
        `Attempting to add rankings for userId/name: ${userId} to pollId: ${pollId}`,
        rankings,
      );
      const key = `polls: ${pollId}`;
      const rankingPath = `rankings.${userId}`;
      const command: Command = new Command('JSON.SET', [
        key,
        'hasStarted',
        rankingPath,
        JSON.stringify(rankingPath),
      ]);
      const currentPoll = await this.redisClient.sendCommand(command);
      const result = currentPoll as string;
      return this.getPoll(result);
    } catch (error) {
      throw new Error(
        `Failed to add rankings for userId/name: ${userId} to pollId: ${pollId}`,
      );
    }
  }

  async addResults(pollId: string, results: Results): Promise<Poll> {
    try {
      this.logger.log(
        `Attempting to add results to pollId: ${pollId}`,
        JSON.stringify(results),
      );
      const key = `polls: ${pollId}`;
      const resultsPath = `results`;
      const command: Command = new Command('JSON.SET', [
        key,
        'hasStarted',
        resultsPath,
        JSON.stringify(resultsPath),
      ]);
      const currentPoll = await this.redisClient.sendCommand(command);
      const result = currentPoll as string;
      return this.getPoll(result);
    } catch (error) {
      throw new HttpException(
        `Error to add results for pollId ${pollId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deletePoll(pollId: string) {
    try {
      const key = `polls: ${pollId}`;
      const command: Command = new Command('JSON.DEL', [key]);
      const currentPoll = await this.redisClient.sendCommand(command);
      const result = currentPoll as string;
      return this.getPoll(result);
    } catch (error) {
      throw new HttpException(
        `Failed to delete poll ${pollId}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
