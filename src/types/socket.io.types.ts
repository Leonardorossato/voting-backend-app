import { INestApplicationContext, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

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
    return super.createIOServer(port, optionsWithCors);
  }
}
