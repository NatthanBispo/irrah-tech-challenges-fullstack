import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateLimitDto {
  @ApiProperty({ example: 15000, description: 'Novo limite em centavos' })
  @IsInt({ message: i18nValidationMessage('validation.AMOUNT_NUMBER') })
  @Min(1, { message: i18nValidationMessage('billing.INVALID_AMOUNT') })
  limit: number;
}
