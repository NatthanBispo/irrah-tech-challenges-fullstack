import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class TopUpDto {
  @ApiProperty({ example: 2500, description: 'Valor em centavos (ex.: 2500 = R$ 25,00)' })
  @IsInt({ message: i18nValidationMessage('validation.AMOUNT_NUMBER') })
  @Min(1, { message: i18nValidationMessage('billing.INVALID_AMOUNT') })
  amount: number;
}
