import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Client } from '@prisma/client';
import { CurrentClient } from '../../../shared/decorators/current-client.decorator';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { ConversationResponseDto } from '../dto/conversation-response.dto';
import { MessageResponseDto } from '../dto/message-response.dto';
import { ListConversationsService } from '../services/list-conversations.service';
import { ListMessagesService } from '../services/list-messages.service';

@ApiTags('conversations')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly listConversationsService: ListConversationsService,
    private readonly listMessagesService: ListMessagesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista conversas do cliente autenticado' })
  @ApiOkResponse({ type: ConversationResponseDto, isArray: true, description: 'Lista de conversas ordenada pela mais recente' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  list(@CurrentClient() client: Client) {
    return this.listConversationsService.execute(client.id);
  }

  @Get(':id/messages')
  @ApiOperation({
    summary: 'Lista mensagens de uma conversa',
    description: 'Marca automaticamente as mensagens recebidas como `read` ao listar.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da conversa',
    example: 'uuid-da-conversa',
  })
  @ApiOkResponse({ type: MessageResponseDto, isArray: true, description: 'Histórico de mensagens da conversa' })
  @ApiBadRequestResponse({ description: 'ID da conversa não é um UUID válido' })
  @ApiNotFoundResponse({ description: 'Conversa não encontrada ou não pertence ao cliente' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  listMessages(
    @CurrentClient() client: Client,
    @Param('id', ParseUUIDPipe) conversationId: string,
  ) {
    return this.listMessagesService.execute(client.id, conversationId);
  }
}
