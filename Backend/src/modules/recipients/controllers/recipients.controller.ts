import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RecipientResponseDto } from '../dto/recipient-response.dto';
import { ListRecipientsService } from '../services/list-recipients.service';

@ApiTags('recipients')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('recipients')
export class RecipientsController {
  constructor(private readonly listRecipientsService: ListRecipientsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista destinatários disponíveis para nova conversa' })
  @ApiOkResponse({ type: RecipientResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  list() {
    return this.listRecipientsService.execute();
  }
}
