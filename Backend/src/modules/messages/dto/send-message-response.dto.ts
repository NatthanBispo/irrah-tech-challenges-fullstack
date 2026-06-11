import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageResponseDto {
  @ApiProperty({ example: 'uuid-da-mensagem' })
  id: string;

  @ApiProperty({ example: 'queued' })
  status: 'queued';

  @ApiProperty({ example: '2026-06-10T12:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '2026-06-10T12:00:05.000Z' })
  estimatedDelivery: string;

  @ApiProperty({ example: 25, description: 'Custo em centavos' })
  cost: number;

  @ApiPropertyOptional({ example: 975, description: 'Saldo restante em centavos' })
  currentBalance?: number;
}
