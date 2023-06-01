import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class CreatePollDto {
  @ApiProperty()
  topic: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(5)
  votesPerVoter: number;

  @ApiProperty()
  name: string;
}

export class JoinPollDto {
  @ApiProperty()
  pollId: string;

  @ApiProperty()
  name: string;
}
