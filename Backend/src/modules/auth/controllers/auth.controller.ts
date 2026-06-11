import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthRequestDto } from '../dto/auth-request.dto';
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
  @ApiOperation({ summary: 'Autentica cliente por CPF/CNPJ' })
  authenticate(@Body() dto: AuthRequestDto) {
    return this.authenticateService.execute(dto);
  }

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Cadastra novo cliente' })
  register(@Body() dto: RegisterRequestDto) {
    return this.registerService.execute(dto);
  }
}
