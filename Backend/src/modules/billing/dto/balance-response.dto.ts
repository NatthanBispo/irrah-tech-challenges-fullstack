import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanType } from '@prisma/client';

export class BalanceResponseDto {
  @ApiProperty({ enum: PlanType, example: PlanType.prepaid })
  planType: PlanType;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Saldo atual em centavos (somente pré-pago)',
  })
  balance?: number;

  @ApiPropertyOptional({
    example: 10000,
    description: 'Limite mensal em centavos (somente pós-pago)',
  })
  limit?: number;

  @ApiPropertyOptional({
    example: 2500,
    description: 'Consumo mensal acumulado em centavos (somente pós-pago)',
  })
  monthlyUsage?: number;

  @ApiPropertyOptional({
    example: 7500,
    description: 'Saldo disponível = limite − consumo, em centavos (somente pós-pago)',
  })
  available?: number;
}
