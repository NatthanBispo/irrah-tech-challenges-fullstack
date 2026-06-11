import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { MessagePriority, MessageType } from '@prisma/client';

export class SendMessageDto {
  @ApiPropertyOptional({ example: 'uuid-da-conversa' })
  @ValidateIf((dto: SendMessageDto) => !dto.recipientId)
  @IsUUID('4', { message: i18nValidationMessage('validation.CONVERSATION_ID_UUID') })
  @IsOptional()
  conversationId?: string;

  @ApiPropertyOptional({ example: 'uuid-do-destinatario' })
  @ValidateIf((dto: SendMessageDto) => !dto.conversationId)
  @IsUUID('4', { message: i18nValidationMessage('validation.RECIPIENT_ID_UUID') })
  @IsOptional()
  recipientId?: string;

  @ApiProperty({ example: 'Olá, como posso ajudar?' })
  @IsString({ message: i18nValidationMessage('validation.CONTENT_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.CONTENT_REQUIRED') })
  content: string;

  @ApiProperty({ enum: MessagePriority, example: MessagePriority.normal })
  @IsEnum(MessagePriority, {
    message: i18nValidationMessage('validation.PRIORITY_ENUM'),
  })
  priority: MessagePriority;

  @ApiPropertyOptional({ enum: MessageType, example: MessageType.whatsapp })
  @IsEnum(MessageType, {
    message: i18nValidationMessage('validation.MESSAGE_TYPE_ENUM'),
  })
  @IsOptional()
  type?: MessageType;
}
