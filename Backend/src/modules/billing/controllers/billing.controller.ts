import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Client } from '@prisma/client';
import { CurrentClient } from '../../../shared/decorators/current-client.decorator';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { ConvertPlanDto } from '../dto/convert-plan.dto';
import { TopUpDto } from '../dto/top-up.dto';
import { TopUpResponseDto } from '../dto/top-up-response.dto';
import { UpdateLimitDto } from '../dto/update-limit.dto';
import { ConvertPlanService } from '../services/convert-plan.service';
import { GetBalanceService } from '../services/get-balance.service';
import { TopUpService } from '../services/top-up.service';
import { UpdateLimitService } from '../services/update-limit.service';

@ApiTags('billing')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('billing')
export class BillingController {
  constructor(
    private readonly topUpService: TopUpService,
    private readonly getBalanceService: GetBalanceService,
    private readonly updateLimitService: UpdateLimitService,
    private readonly convertPlanService: ConvertPlanService,
  ) {}

  @Post('top-up')
  @ApiOperation({ summary: 'Adiciona créditos ao saldo (cliente pré-pago)' })
  @ApiCreatedResponse({ type: TopUpResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  topUp(@CurrentClient() client: Client, @Body() dto: TopUpDto) {
    return this.topUpService.execute(client, dto);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Consulta saldo (pré-pago) ou consumo/limite (pós-pago)' })
  @ApiOkResponse({ description: 'Dados financeiros do cliente' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  balance(@CurrentClient() client: Client) {
    return this.getBalanceService.execute(client);
  }

  @Patch('limit')
  @ApiOperation({ summary: 'Ajusta limite mensal (cliente pós-pago)' })
  @ApiOkResponse({ description: 'Novo limite definido' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  updateLimit(@CurrentClient() client: Client, @Body() dto: UpdateLimitDto) {
    return this.updateLimitService.execute(client, dto);
  }

  @Post('plan-conversion')
  @ApiOperation({ summary: 'Converte entre planos pré-pago e pós-pago' })
  @ApiOkResponse({ description: 'Plano convertido com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  convertPlan(@CurrentClient() client: Client, @Body() dto: ConvertPlanDto) {
    return this.convertPlanService.execute(client, dto);
  }
}
