import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Client } from '@prisma/client';
import { TransactionType } from '@prisma/client';
import { CurrentClient } from '../../../shared/decorators/current-client.decorator';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { TransactionResponseDto } from '../dto/transaction-response.dto';
import { ListTransactionsService } from '../services/list-transactions.service';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly listTransactionsService: ListTransactionsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Lista histórico de transações financeiras',
    description:
      'Retorna todas as transações do cliente. Suporta filtro por tipo (`type`) e intervalo de datas (`from`/`to` no formato ISO 8601 ou `YYYY-MM-DD`).',
  })
  @ApiOkResponse({ type: TransactionResponseDto, isArray: true, description: 'Lista de transações ordenada da mais recente para a mais antiga' })
  @ApiQuery({
    name: 'type',
    enum: TransactionType,
    required: false,
    description: 'Filtra por tipo de transação',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    example: '2026-06-01',
    description: 'Data de início do filtro (ISO 8601)',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    example: '2026-06-30',
    description: 'Data de fim do filtro (ISO 8601)',
  })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  list(
    @CurrentClient() client: Client,
    @Query('type') type?: TransactionType,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.listTransactionsService.execute(client.id, { type, from, to });
  }
}
