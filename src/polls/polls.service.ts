import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  CreatePollField,
  JoinPollField,
  RejoinPollField,
} from 'src/types/types';
import { createPollID, createUserID } from 'src/utils/utils';
import { PollRepository } from './repository/poll.repository';

@Injectable()
export class PollsService {
  private readonly logger = new Logger(PollsService.name);
  constructor(private readonly pollRepository: PollRepository) {}

  async create(fields: CreatePollField) {
    try {
      const pollId = createPollID();
      const userId = createUserID();
      const createPoll = await this.pollRepository.createPoll({
        ...fields,
        pollId,
        userId,
      });
      return createPoll;
    } catch (error) {
      throw new HttpException('Error creating poll', HttpStatus.BAD_REQUEST);
    }
  }

  async joinPoll(dto: JoinPollField) {
    try {
      const userId = createUserID();
      this.logger.debug(
        `Fetching with id:${dto.pollId} for user with id: ${userId}`,
      );
      const joinPoll = await this.pollRepository.getPoll(dto.pollId);
      return joinPoll;
    } catch (error) {
      throw new HttpException('Error joining poll', HttpStatus.BAD_REQUEST);
    }
  }

  async rejoinPoll(fields: RejoinPollField) {
    try {
      this.logger.debug(
        `Rejoining with id:${fields.pollId} for user with id: ${fields.userId} with name: ${fields.name}`,
      );

      const joinedPoll = await this.pollRepository.addParticipant(fields);
      return joinedPoll;
    } catch (error) {
      throw new HttpException('Error joining poll', HttpStatus.BAD_REQUEST);
    }
  }
}
