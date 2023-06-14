import { INestApplicationContext, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { SocketWithAuth } from './types';

export class SocketIoTypes extends IoAdapter {
  private readonly logger = new Logger(SocketIoTypes.name);
  constructor(private readonly app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const clientPort = process.env.APP_PORT;
    const cors = {
      origin: [`https://localhost:${clientPort}/api`],
    };
    this.logger.log(
      'Configuring SocketIO server with custom CORS options',
      cors,
    );

    const optionsWithCors: ServerOptions = {
      ...options,
      cors,
    };

    const jwtService = this.app.get(JwtService);
    const server: Server = super.createIOServer(port, optionsWithCors);
    server.of('polls').use(createTokenMiddleware(jwtService, this.logger));
    return server;
  }
}

const createTokenMiddleware =
  (jwtSersice: JwtService, logger: Logger) =>
  (socket: SocketWithAuth, next) => {
    try {
      const token =
        socket.handshake.auth.token || socket.handshake.headers['token'];
      logger.debug(`Validating auth token: ${token}`);
      const payload = jwtSersice.verify(token);
      socket.userId = payload.sub;
      socket.pollId = payload.pollId;
      socket.name = payload.name;
      next();
    } catch (error) {
      throw new Error('Forbidden token');
    }
  };
