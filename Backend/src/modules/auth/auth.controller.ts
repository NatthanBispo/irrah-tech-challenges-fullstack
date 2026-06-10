import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthRequestDto } from './dto/auth-request.dto';

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
}
