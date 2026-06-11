import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
  @ApiOperation({
    summary: 'Envia mensagem para conversa existente ou nova',
    description:
      'Informe `conversationId` para uma conversa existente ou `recipientId` para iniciar uma nova. ' +
      'Mensagens normais custam R$ 0,25 (25 centavos) e urgentes R$ 0,50 (50 centavos). ' +
      'O campo `type` define o canal (`whatsapp` padrão ou `sms`).',
  })
  @ApiCreatedResponse({ type: SendMessageResponseDto, description: 'Mensagem enfileirada com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos ou conversationId/recipientId não informado' })
  @ApiPaymentRequiredResponse({ description: 'Saldo insuficiente (pré-pago) ou limite mensal excedido (pós-pago)' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  send(@CurrentClient() client: Client, @Body() dto: SendMessageDto) {
    return this.sendMessageService.execute(client, dto);
  }
}
