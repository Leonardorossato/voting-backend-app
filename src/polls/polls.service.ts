import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Poll } from 'src/shared';
import {
  AddNominationFields,
  AddParticipantData,
  CreatePollField,
  JoinPollField,
  RejoinPollField,
  SubmitRankingsFields,
} from 'src/types/types';
import {
  createNominationID,
  createPollID,
  createUserID,
} from 'src/utils/utils';
import { PollRepository } from './repository/poll.repository';

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

  async joinPoll(fields: JoinPollField) {
    try {
      const userId = createUserID();
      this.logger.debug(
        `Fetching with id:${fields.pollId} for user with id: ${userId}`,
      );
      const joinPoll = await this.pollRepository.getPoll(fields.pollId);
      this.logger.debug(
        `Creating token for pollId: ${joinPoll.id} and user name: ${userId}`,
      );

      const token = await this.jwtService.sign(
        {
          pollId: joinPoll.id,
          name: fields.name,
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

  async addParticipant(addParticipant: AddParticipantData): Promise<Poll> {
    return await this.pollRepository.addParticipant(addParticipant);
  }

  async removeParticipant(pollId: string, userId: string): Promise<Poll> {
    try {
      const poll = await this.pollRepository.getPoll(pollId);
      if (!poll.hasStarted) {
        const updatePoll = await this.pollRepository.removeParticipant(
          pollId,
          userId,
        );
        return updatePoll;
      }
    } catch (error) {
      throw new HttpException(
        'Error removing participant',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getPoll(pollId: string): Promise<Poll> {
    return await this.pollRepository.getPoll(pollId);
  }

  async addNomination({
    pollId,
    userId,
    text,
  }: AddNominationFields): Promise<Poll> {
    return await this.pollRepository.addNomination({
      pollId,
      nominationId: createNominationID(),
      nomination: {
        userId,
        text,
      },
    });
  }

  async removeNomination(pollId: string, nominationId: string): Promise<Poll> {
    return await this.pollRepository.removeNomination(pollId, nominationId);
  }

  async startPoll(pollId: string): Promise<Poll> {
    return await this.pollRepository.startPoll(pollId);
  }

  async sumitedRankings(
    sumitedRankingsData: SubmitRankingsFields,
  ): Promise<Poll> {
    try {
      const hasPollStarted = await this.pollRepository.getPoll(
        sumitedRankingsData.pollId,
      );
      if (!hasPollStarted) {
        throw new HttpException(
          'Participants cannot rank util the poll has started',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return await this.pollRepository.addParticipantRankings(
        sumitedRankingsData,
      );
    } catch (error) {}
  }
}
