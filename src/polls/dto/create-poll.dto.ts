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
  @ApiProperty({ minLength: 6, maxLength: 6 })
  polId: string;

  @ApiProperty({ minLength: 1, maxLength: 18 })
  name: string;
}
