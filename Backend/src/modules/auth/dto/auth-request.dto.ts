import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsValidDocument } from '../../../shared/validators/is-valid-document.validator';
import { DocumentType } from '../../../shared/utils/enums';

export class AuthRequestDto {
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

  @ApiProperty({ example: 'Senha1234' })
  @IsString({ message: i18nValidationMessage('validation.PASSWORD_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.PASSWORD_REQUIRED') })
  password: string;
}
