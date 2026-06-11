import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiPaymentRequiredResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Client } from '@prisma/client';
import { CurrentClient } from '../../../shared/decorators/current-client.decorator';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { SendMessageDto } from '../dto/send-message.dto';
import { SendMessageResponseDto } from '../dto/send-message-response.dto';
import { SendMessageService } from '../services/send-message.service';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly sendMessageService: SendMessageService) {}

  @Post()
  @ApiOperation({ summary: 'Envia mensagem para conversa existente ou nova' })
  @ApiCreatedResponse({ type: SendMessageResponseDto })
  @ApiPaymentRequiredResponse({ description: 'Saldo insuficiente ou limite excedido' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  send(@CurrentClient() client: Client, @Body() dto: SendMessageDto) {
    return this.sendMessageService.execute(client, dto);
  }
}
