import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthRequestDto } from './dto/auth-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Autentica cliente por CPF/CNPJ' })
  authenticate(@Body() dto: AuthRequestDto) {
    return this.authService.authenticate(dto);
  }

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Cadastra novo cliente' })
  register(@Body() dto: RegisterRequestDto) {
    return this.authService.register(dto);
  }
}
