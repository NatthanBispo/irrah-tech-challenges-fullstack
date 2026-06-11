import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType, PlanType } from '@prisma/client';

export class ClientResponseDto {
  @ApiProperty({ example: 'uuid-do-cliente' })
  id: string;

  @ApiProperty({ example: 'Empresa ABC Ltda' })
  name: string;

  @ApiProperty({ example: '39053344705' })
  documentId: string;

  @ApiProperty({ enum: DocumentType, example: DocumentType.CPF })
  documentType: DocumentType;

  @ApiProperty({ enum: PlanType, example: PlanType.prepaid })
  planType: PlanType;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Saldo em centavos — presente apenas em clientes pré-pagos',
  })
  balance?: number;

  @ApiPropertyOptional({
    example: 10000,
    description: 'Limite mensal em centavos — presente apenas em clientes pós-pagos',
  })
  limit?: number;

  @ApiPropertyOptional({
    example: 2500,
    description: 'Consumo mensal em centavos — presente apenas em clientes pós-pagos',
  })
  monthlyUsage?: number;

  @ApiProperty({ example: true })
  active: boolean;
}
