import { ApiProperty } from '@nestjs/swagger';
import { MessagePriority, MessageStatus, MessageType, SenderType } from '@prisma/client';

class MessageSenderDto {
  @ApiProperty({ example: 'uuid-do-remetente' })
  id: string;

  @ApiProperty({ enum: SenderType, example: SenderType.client })
  type: SenderType;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'uuid-da-mensagem' })
  id: string;

  @ApiProperty({ example: 'uuid-da-conversa' })
  conversationId: string;

  @ApiProperty({ example: 'Conteúdo da mensagem' })
  content: string;

  @ApiProperty({ type: MessageSenderDto })
  sentBy: MessageSenderDto;

  @ApiProperty({ example: '2026-06-10T12:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ enum: MessagePriority, example: MessagePriority.normal })
  priority: MessagePriority;

  @ApiProperty({ enum: MessageStatus, example: MessageStatus.delivered })
  status: MessageStatus;

  @ApiProperty({ example: 25, description: 'Custo em centavos' })
  cost: number;

  @ApiProperty({ enum: MessageType, example: MessageType.whatsapp })
  type: MessageType;
}
