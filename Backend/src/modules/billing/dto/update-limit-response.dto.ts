import { ApiProperty } from '@nestjs/swagger';

export class UpdateLimitResponseDto {
  @ApiProperty({ example: 15000, description: 'Novo limite mensal em centavos' })
  limit: number;
}
