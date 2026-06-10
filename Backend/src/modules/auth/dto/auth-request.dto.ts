import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DocumentType } from '../../../shared/utils/enums';

export class AuthRequestDto {
  @ApiProperty({ example: '12345678901' })
  @IsString()
  @IsNotEmpty()
  documentId: string;

  @ApiProperty({ enum: DocumentType, example: DocumentType.CPF })
  @IsEnum(DocumentType)
  documentType: DocumentType;
}
