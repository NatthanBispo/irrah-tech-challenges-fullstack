import { ApiProperty } from '@nestjs/swagger';
import { ClientResponseDto } from './client-response.dto';

export class AuthResponseDto {
  @ApiProperty({
    example: 'uuid-do-cliente',
    description: 'Token de autenticação — equivale ao ID do cliente',
  })
  token: string;

  @ApiProperty({ type: ClientResponseDto })
  client: ClientResponseDto;
}
