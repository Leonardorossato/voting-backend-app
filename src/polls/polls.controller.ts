import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PollsService } from './polls.service';
import { CreatePollDto, JoinPollDto } from './dto/create-poll.dto';
import { ApiTags } from '@nestjs/swagger';
import { RejoinPollField, RequestWithAuth } from 'src/types/types';
import { AuthGuard } from 'src/guards/auth.guard';

@ApiTags('Enquetes')
@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Post('/create')
  async create(@Body() createPollDto: CreatePollDto) {
    return this.pollsService.create(createPollDto);
  }

  @Post('/join-player-2')
  async joinPlayer2(@Body() dto: JoinPollDto) {
    return await this.pollsService.joinPoll(dto);
  }

  @Post('/join-player-3')
  async joinPlayer3(@Body() dto: JoinPollDto) {
    return await this.pollsService.joinPoll(dto);
  }

  @Post('/join-player-4')
  async joinPlayer4(@Body() dto: JoinPollDto) {
    return await this.pollsService.joinPoll(dto);
  }

  @UseGuards(AuthGuard)
  @Post('/rejoin')
  async rejoin(@Req() req: RequestWithAuth) {
    const { userId, pollId, name } = req;
    return await this.pollsService.rejoinPoll({
      userId,
      pollId,
      name,
    });
  }
}
