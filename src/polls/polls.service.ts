import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  CreatePollField,
  JoinPollField,
  RejoinPollField,
} from 'src/types/types';
import { createPollID, createUserID } from 'src/utils/utils';
import { PollRepository } from './repository/poll.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PollsService {
  private readonly logger = new Logger(PollsService.name);
  constructor(
    private readonly pollRepository: PollRepository,
    private readonly jwtService: JwtService,
  ) {}

  async create(fields: CreatePollField) {
    try {
      const pollId = createPollID();
      const userId = createUserID();
      const createPoll = await this.pollRepository.createPoll({
        ...fields,
        pollId,
        userId,
      });
      this.logger.debug(
        `Creating a token for pollId: ${createPoll.id} and userId: ${userId}`,
      );
      const singed = this.jwtService.sign(
        {
          pollId: createPoll.id,
          name: fields.name,
        },
        {
          subject: userId,
        },
      );
      return {
        poll: createPoll,
        access_token: singed,
      };
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
      this.logger.debug(
        `Creating token for pollId: ${joinPoll.id} and user name: ${userId}`,
      );

      const token = this.jwtService.sign(
        {
          pollId: joinPoll.id,
          name: dto.name,
        },
        {
          subject: userId,
        },
      );
      return { access_token: token, poll: joinPoll };
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
