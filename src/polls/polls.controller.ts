import { Controller, Post, Body } from '@nestjs/common';
import { PollsService } from './polls.service';
import { CreatePollDto, JoinPollDto } from './dto/create-poll.dto';
import { ApiTags } from '@nestjs/swagger';
import { RejoinPollField } from 'src/types/types';

@ApiTags('Enquetes')
@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Post('/create')
  async create(@Body() createPollDto: CreatePollDto) {
    return this.pollsService.create(createPollDto);
  }

  @Post('/join')
  async join(@Body() dto: JoinPollDto) {
    return await this.pollsService.joinPoll(dto);
  }

  @Post('/rejoin')
  async rejoin() {
    return await this.pollsService.rejoinPoll({
      name: 'Eu',
      pollId: 'aa5ssadsa4d684d',
      userId: 'dsa5d4sa5',
    });
  }
}
