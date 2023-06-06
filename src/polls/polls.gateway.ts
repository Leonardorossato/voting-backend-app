import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
} from '@nestjs/websockets';
import { PollsService } from './polls.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'polls',
})
export class PollsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(PollsGateway.name);
  constructor(private readonly pollsService: PollsService) {}

  handleConnection(client: any) {
    throw new Error('Method not implemented');
  }

  handleDisconnect(client: any) {
    throw new Error('Method not implemented');
  }

  afterInit() {
    this.logger.log(`Websocket Gateway initialized.`);
  }
}
