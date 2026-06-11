import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthRequestDto } from '../dto/auth-request.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { AuthenticateService } from '../services/authenticate.service';
import { RegisterService } from '../services/register.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authenticateService: AuthenticateService,
    private readonly registerService: RegisterService,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Autentica cliente por CPF/CNPJ',
    description: 'O token retornado é o próprio ID do cliente e deve ser enviado como Bearer token nas demais rotas.',
  })
  @ApiOkResponse({ type: AuthResponseDto, description: 'Autenticação bem-sucedida' })
  @ApiUnauthorizedResponse({ description: 'Documento não encontrado ou cliente inativo' })
  @ApiBadRequestResponse({ description: 'Documento inválido ou dados incorretos' })
  authenticate(@Body() dto: AuthRequestDto) {
    return this.authenticateService.execute(dto);
  }

  @Post('register')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Cadastra novo cliente',
    description: 'Cria um cliente pré-pago (saldo R$ 0,00) ou pós-pago (limite mensal R$ 100,00). Retorna o token e os dados do cliente.',
  })
  @ApiCreatedResponse({ type: AuthResponseDto, description: 'Cliente cadastrado com sucesso' })
  @ApiConflictResponse({ description: 'Documento já cadastrado' })
  @ApiBadRequestResponse({ description: 'Dados de cadastro inválidos' })
  register(@Body() dto: RegisterRequestDto) {
    return this.registerService.execute(dto);
  }
}
