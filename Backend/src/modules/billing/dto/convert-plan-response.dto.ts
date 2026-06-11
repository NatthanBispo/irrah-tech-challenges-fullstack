import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanType } from '@prisma/client';

export class ConvertPlanResponseDto {
  @ApiProperty({ enum: PlanType, example: PlanType.postpaid })
  planType: PlanType;

  @ApiPropertyOptional({
    example: 0,
    description: 'Saldo em centavos após conversão para pré-pago',
  })
  balance?: number;

  @ApiPropertyOptional({
    example: 10000,
    description: 'Limite mensal em centavos após conversão para pós-pago',
  })
  limit?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Consumo mensal em centavos após conversão para pós-pago',
  })
  monthlyUsage?: number;

  @ApiPropertyOptional({
    example: 10000,
    description: 'Saldo disponível em centavos após conversão para pós-pago',
  })
  available?: number;
}
