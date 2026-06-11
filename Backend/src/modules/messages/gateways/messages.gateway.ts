import { Logger, OnModuleInit } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessageStatus } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../../shared/database/prisma.service';

@WebSocketGateway({
  namespace: '/messages',
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  private readonly server: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.logger.log('WebSocket gateway iniciado em /messages');
  }

  async handleConnection(socket: Socket) {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
      socket.disconnect();
      return;
    }

    const client = await this.prisma.client.findFirst({
      where: { id: token, active: true },
    });

    if (!client) {
      socket.disconnect();
      return;
    }

    const room = `client:${client.id}`;
    await socket.join(room);
    socket.data.clientId = client.id;

    this.logger.debug(`Cliente ${client.id} conectado (socket ${socket.id})`);
  }

  handleDisconnect(socket: Socket) {
    this.logger.debug(
      `Socket ${socket.id} desconectado (clientId: ${String(socket.data.clientId ?? 'unknown')})`,
    );
  }

  emitStatusUpdate(
    clientId: string,
    payload: {
      messageId: string;
      conversationId: string;
      status: MessageStatus;
    },
  ) {
    this.server.to(`client:${clientId}`).emit('message:status_updated', payload);
  }

  emitNewReply(clientId: string, payload: { conversationId: string }) {
    this.server.to(`client:${clientId}`).emit('message:new_reply', payload);
  }
}
