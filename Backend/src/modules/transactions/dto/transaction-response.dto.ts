import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class TransactionResponseDto {
  @ApiProperty({ example: 'uuid-da-transacao' })
  id: string;

  @ApiProperty({ enum: TransactionType })
  type: TransactionType;

  @ApiProperty({ example: 25, description: 'Valor em centavos' })
  amount: number;

  @ApiProperty({ example: 'Débito por envio de mensagem normal' })
  description: string;

  @ApiPropertyOptional({ example: 975 })
  balanceAfter?: number | null;

  @ApiPropertyOptional({ example: 'uuid-da-mensagem' })
  messageId?: string | null;

  @ApiProperty({ example: '2026-06-11T12:00:00.000Z' })
  createdAt: string;
}
