import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreatePollField,
  JoinPollField,
  RejoinPollField,
} from 'src/types/types';
import { createPollID, createUserID } from 'src/utils/utils';

@Injectable()
export class PollsService {
  create(fields: CreatePollField) {
    try {
      const pollId = createPollID();
      const userId = createUserID();
      return {
        ...fields,
        userId,
        pollId,
      };
    } catch (error) {
      throw new HttpException('Error creating poll', HttpStatus.BAD_REQUEST);
    }
  }

  async joinPoll(dto: JoinPollField) {
    try {
      const userId = createUserID();
      return {
        ...dto,
        userId,
      };
    } catch (error) {
      throw new HttpException('Error joining poll', HttpStatus.BAD_REQUEST);
    }
  }

  async rejoinPoll(fields: RejoinPollField) {
    return fields;
  }
}
