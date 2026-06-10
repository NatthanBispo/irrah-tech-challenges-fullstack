import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsValidDocument } from '../../../shared/validators/is-valid-document.validator';
import { DocumentType, PlanType } from '../../../shared/utils/enums';

export class RegisterRequestDto {
  @ApiProperty({ example: 'Empresa ABC Ltda' })
  @IsString({ message: i18nValidationMessage('validation.NAME_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.NAME_REQUIRED') })
  name: string;

  @ApiProperty({ example: '39053344705' })
  @IsString({ message: i18nValidationMessage('validation.DOCUMENT_ID_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.DOCUMENT_ID_REQUIRED') })
  @IsValidDocument()
  documentId: string;

  @ApiProperty({ enum: DocumentType, example: DocumentType.CPF })
  @IsEnum(DocumentType, {
    message: i18nValidationMessage('validation.DOCUMENT_TYPE_ENUM'),
  })
  documentType: DocumentType;

  @ApiProperty({ enum: PlanType, example: PlanType.prepaid })
  @IsEnum(PlanType, {
    message: i18nValidationMessage('validation.PLAN_TYPE_ENUM'),
  })
  planType: PlanType;
}
