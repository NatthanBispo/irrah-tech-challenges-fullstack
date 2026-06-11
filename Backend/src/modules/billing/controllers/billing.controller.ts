import { Body, Controller, Get, HttpCode, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
import { BalanceResponseDto } from '../dto/balance-response.dto';
import { ConvertPlanDto } from '../dto/convert-plan.dto';
import { ConvertPlanResponseDto } from '../dto/convert-plan-response.dto';
import { TopUpDto } from '../dto/top-up.dto';
import { TopUpResponseDto } from '../dto/top-up-response.dto';
import { UpdateLimitDto } from '../dto/update-limit.dto';
import { UpdateLimitResponseDto } from '../dto/update-limit-response.dto';
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
  @ApiOperation({
    summary: 'Adiciona créditos ao saldo (cliente pré-pago)',
    description: 'Recebe um valor em centavos e incrementa o saldo do cliente. Registra uma transação do tipo `credit`.',
  })
  @ApiCreatedResponse({ type: TopUpResponseDto, description: 'Saldo atualizado com sucesso' })
  @ApiBadRequestResponse({ description: 'Valor inválido ou cliente não é pré-pago' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  topUp(@CurrentClient() client: Client, @Body() dto: TopUpDto) {
    return this.topUpService.execute(client, dto);
  }

  @Get('balance')
  @ApiOperation({
    summary: 'Consulta saldo ou consumo do cliente',
    description:
      'Para clientes pré-pagos retorna `planType` e `balance`. ' +
      'Para pós-pagos retorna `planType`, `limit`, `monthlyUsage` e `available`.',
  })
  @ApiOkResponse({ type: BalanceResponseDto, description: 'Dados financeiros do cliente' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  balance(@CurrentClient() client: Client) {
    return this.getBalanceService.execute(client);
  }

  @Patch('limit')
  @ApiOperation({
    summary: 'Ajusta limite mensal (cliente pós-pago)',
    description: 'O novo limite deve ser ≥ consumo mensal acumulado.',
  })
  @ApiOkResponse({ type: UpdateLimitResponseDto, description: 'Limite atualizado' })
  @ApiBadRequestResponse({ description: 'Novo limite abaixo do consumo atual ou cliente não é pós-pago' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  updateLimit(@CurrentClient() client: Client, @Body() dto: UpdateLimitDto) {
    return this.updateLimitService.execute(client, dto);
  }

  @Post('plan-conversion')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Converte entre planos pré-pago e pós-pago',
    description:
      'Pré→Pós: saldo residual é registrado como `plan_conversion_credit`; limite padrão de R$ 100,00 é aplicado. ' +
      'Pós→Pré: consumo pendente é registrado como `postpaid_settlement`; limite e consumo são zerados.',
  })
  @ApiOkResponse({ type: ConvertPlanResponseDto, description: 'Plano convertido com sucesso' })
  @ApiBadRequestResponse({ description: 'Cliente já está no plano solicitado' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  convertPlan(@CurrentClient() client: Client, @Body() dto: ConvertPlanDto) {
    return this.convertPlanService.execute(client, dto);
  }
}
