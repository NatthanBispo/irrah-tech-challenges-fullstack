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
  @ApiOperation({ summary: 'Lista histórico de transações financeiras' })
  @ApiOkResponse({ type: TransactionResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  @ApiQuery({ name: 'type', enum: TransactionType, required: false })
  @ApiQuery({ name: 'from', required: false, example: '2026-06-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-06-30' })
  list(
    @CurrentClient() client: Client,
    @Query('type') type?: TransactionType,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.listTransactionsService.execute(client.id, { type, from, to });
  }
}
