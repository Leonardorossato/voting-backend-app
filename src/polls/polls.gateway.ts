import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { PollsService } from './polls.service';
import { Logger } from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { SocketWithAuth } from 'src/types/types';

@WebSocketGateway({
  namespace: 'polls',
})
export class PollsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(PollsGateway.name);
  constructor(private readonly pollsService: PollsService) {}

  @WebSocketServer() io: Namespace;

  afterInit() {
    this.logger.log(`Websocket Gateway initialized.`);
  }

  handleConnection(client: SocketWithAuth) {
    try {
      const sockets = this.io.sockets;
      this.logger.debug(
        `Socket connected with userId: ${client.userId}, pollId: ${client.pollId} and name: ${client.name}`,
      );
      this.logger.log(`WS Client with ${client.id} connected.`);
      this.logger.debug(`Number of connected sockets: ${sockets.size}`);
    } catch (error) {
      throw new Error('Method not implemented');
    }
  }

  handleDisconnect(client: SocketWithAuth) {
    try {
      const sockets = this.io.sockets;
      this.logger.debug(
        `Socket connected with userId: ${client.userId}, pollId: ${client.pollId} and name: ${client.name}`,
      );
      this.logger.log(`Disconneted docket: ${client.id}.`);
      this.logger.debug(`Number of disconneted sockets: ${sockets.size}`);
    } catch (error) {
      throw new Error('Method not implemented');
    }
  }
}
