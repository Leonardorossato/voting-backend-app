import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { PollsService } from './polls.service';
import { HttpException, HttpStatus, Logger, UseGuards } from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { SocketWithAuth } from 'src/types/types';
import { GatewayGuard } from 'src/guards/gateway.admin.guard';
import { NominationDto } from './dto/create-poll.dto';

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

  @UseGuards(GatewayGuard)
  @SubscribeMessage('remove_participant')
  async removeParticipant(
    @MessageBody('id') id: string,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    try {
      this.logger.debug(
        `Attempting to remove participant: ${id} from poll ${client.pollId}`,
      );
      const updatedPoll = await this.pollsService.removeParticipant(
        client.pollId,
        id,
      );
      if (updatedPoll) {
        this.io.to(client.pollId).emit('poll_updated', updatedPoll);
      }
    } catch (error) {
      throw new HttpException(
        'Error removing participants from poll by admin',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(GatewayGuard)
  @SubscribeMessage('nominate')
  async nomite(
    @MessageBody() nomination: NominationDto,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    try {
      this.logger.debug(
        `Attempting to remove participant: ${client.id} from poll ${client.pollId}\n${nomination.text}`,
      );
      const updatedPoll = await this.pollsService.addNomination({
        pollId: client.pollId,
        userId: client.userId,
        text: nomination.text,
      });

      return this.io.to(client.pollId).emit('poll_updated', updatedPoll);
    } catch (error) {
      throw new HttpException(
        'Error removing participants from poll by admin',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(GatewayGuard)
  @SubscribeMessage('remove_nomination')
  async removeNomination(
    @MessageBody('id') nominationId: string,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    try {
      this.logger.debug(
        `Attempting to remove participant: ${client.id} from poll ${client.pollId}`,
      );
      const updatedPoll = await this.pollsService.removeNomination(
        client.pollId,
        nominationId,
      );

      return this.io.to(client.pollId).emit('poll_updated', updatedPoll);
    } catch (error) {
      throw new HttpException(
        'Error removing participants from poll by admin',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(GatewayGuard)
  @SubscribeMessage('start_vote')
  async startVote(@ConnectedSocket() client: SocketWithAuth): Promise<void> {
    this.logger.debug(`Attempting to start voting for poll: ${client.pollId}`);
    const updatedPoll = await this.pollsService.startPoll(client.pollId);
    this.io.to(client.pollId).emit('poll_updated', updatedPoll);
  }

  @UseGuards(GatewayGuard)
  @SubscribeMessage('remove_nomination')
  async submtiRankings(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody('rankings') rankings: string[],
  ): Promise<void> {
    this.logger.debug(
      `Sumitting votes for user: ${client.userId} belonging to pollId: ${client.pollId}`,
    );
    const updatedPoll = await this.pollsService.sumitedRankings({
      pollId: client.pollId,
      userId: client.userId,
      rankings,
    });
    this.io.to(client.pollId).emit('poll_updated', updatedPoll);
  }

  @UseGuards(GatewayGuard)
  @SubscribeMessage('close_poll')
  async closePoll(@ConnectedSocket() client: SocketWithAuth) {
    this.logger.debug(`Closing poll: ${client.pollId} and computing result`);
    await this.pollsService.computerResults(client.pollId);
    return this.io.to(client.pollId).emit('poll_updated');
  }
}
