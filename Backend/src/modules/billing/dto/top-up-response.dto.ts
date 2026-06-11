import { ApiProperty } from '@nestjs/swagger';

export class TopUpResponseDto {
  @ApiProperty({ example: 2500, description: 'Saldo em centavos' })
  balance: number;
}
