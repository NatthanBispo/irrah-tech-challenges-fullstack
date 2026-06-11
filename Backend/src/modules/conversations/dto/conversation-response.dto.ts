import { ApiProperty } from '@nestjs/swagger';

export class ConversationResponseDto {
  @ApiProperty({ example: 'uuid-da-conversa' })
  id: string;

  @ApiProperty({ example: 'uuid-do-destinatario' })
  recipientId: string;

  @ApiProperty({ example: 'Maria Silva' })
  recipientName: string;

  @ApiProperty({ example: 'Olá, preciso de ajuda!' })
  lastMessageContent: string;

  @ApiProperty({ example: '2026-06-10T12:00:00.000Z' })
  lastMessageTime: string;

  @ApiProperty({ example: 2 })
  unreadCount: number;
}
