import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PlanType } from '@prisma/client';

export class ConvertPlanDto {
  @ApiProperty({ enum: PlanType, example: PlanType.postpaid })
  @IsEnum(PlanType, {
    message: i18nValidationMessage('validation.PLAN_TYPE_ENUM'),
  })
  planType: PlanType;
}
