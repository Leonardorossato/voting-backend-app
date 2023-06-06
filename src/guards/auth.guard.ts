import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    this.logger.debug(
      `Checking for auth token on request body: ${request.body}`,
    );
    try {
      const { accessToken } = request.body;
      const payload = this.jwtService.verify(accessToken);
      request.userId = payload.userId;
      request.userId = payload.userId;
      request.name = payload.accessToken;
      return true;
    } catch (error) {
      throw new ForbiddenException('Invalid access token' + error);
    }
  }
}
