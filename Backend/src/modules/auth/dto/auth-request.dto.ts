import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { DocumentType } from '../../../shared/utils/enums';

export class AuthRequestDto {
  @ApiProperty({ example: '12345678901' })
  @IsString({ message: i18nValidationMessage('validation.DOCUMENT_ID_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.DOCUMENT_ID_REQUIRED') })
  documentId: string;

  @ApiProperty({ enum: DocumentType, example: DocumentType.CPF })
  @IsEnum(DocumentType, {
    message: i18nValidationMessage('validation.DOCUMENT_TYPE_ENUM'),
  })
  documentType: DocumentType;
}
