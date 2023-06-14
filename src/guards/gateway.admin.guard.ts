import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PollsService } from 'src/polls/polls.service';
import { AuthPayload, SocketWithAuth } from 'src/types/types';

@Injectable()
export class GatewayGuard implements CanActivate {
  private readonly logger = new Logger(GatewayGuard.name);

  constructor(
    private readonly pollService: PollsService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const socket: SocketWithAuth = context.switchToWs().getClient();
      const token =
        socket.handshake.auth.token || socket.handshake.headers['token'];
      if (!token) {
        this.logger.error('No authentication token provided.');
        throw new Error('No authentication token provided');
      }
      const payload = this.jwtService.verify<AuthPayload & { sub: string }>(
        token,
      );
      this.logger.debug(`Validating admin using token payload`, payload);
      const { sub, pollId } = payload;
      const poll = await this.pollService.getPoll(pollId);
      if (sub !== poll.adminId) {
        throw new HttpException(
          'Admin privileges required',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return true;
    } catch (error) {
      throw new HttpException(
        'Error validating admin token payload',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
