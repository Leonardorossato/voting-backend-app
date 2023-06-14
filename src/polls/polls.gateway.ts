import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
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

  async handleConnection(client: SocketWithAuth) {
    try {
      const sockets = this.io.sockets;
      this.logger.debug(
        `Socket connected with userId: ${client.userId}, pollId: ${client.pollId} and name: ${client.name}`,
      );
      this.logger.log(`WS Client with ${client.id} connected.`);
      this.logger.debug(`Number of connected sockets: ${sockets.size}`);
      const roomName = client.pollId;
      await client.join(roomName);
      const connectedClients = this.io.adapter.rooms.get(roomName).size ?? 0;
      this.logger.debug(
        `userId: ${client.userId} joined in room with name: ${roomName}`,
      );
      this.logger.debug(
        `Total clients connectd to this room : ${roomName} : ${connectedClients}`,
      );
      const updatedPoll = await this.pollsService.addParticipant({
        pollId: client.pollId,
        userId: client.userId,
        name: client.name,
      });
      return this.io.to(roomName).emit('poll_updated', updatedPoll);
    } catch (error) {
      throw new Error('Method not implemented');
    }
  }

  async handleDisconnect(client: SocketWithAuth) {
    try {
      const { pollId, userId } = client;
      const updatedPoll = await this.pollsService.removeParticipant(
        pollId,
        userId,
      );
      const roomName = client.pollId;
      const clientCount = this.io.adapter.rooms.get(roomName).size ?? 0;
      this.logger.log(`Disconnected socket io: ${client.userId}`);
      this.logger.log(`Number of connected sockets: ${clientCount}.`);
      this.logger.debug(
        `Total of clients connected to this room: ${roomName}: ${clientCount}`,
      );
      if (updatedPoll) {
        this.io.to(pollId).emit('poll_updated', updatedPoll);
      }
    } catch (error) {
      throw new Error('Method not implemented');
    }
  }

  @SubscribeMessage('test')
  async test() {
    throw new Error('plain operation');
  }
}
