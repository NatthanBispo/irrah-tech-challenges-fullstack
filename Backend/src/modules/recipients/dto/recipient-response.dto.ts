import { ApiProperty } from '@nestjs/swagger';

export class RecipientResponseDto {
  @ApiProperty({ example: 'uuid-do-destinatario' })
  id: string;

  @ApiProperty({ example: 'Maria Silva' })
  name: string;
}
