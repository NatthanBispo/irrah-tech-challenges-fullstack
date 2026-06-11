import { Module } from '@nestjs/common';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { ConversationsController } from './controllers/conversations.controller';
import { ConversationsRepository } from './repositories/conversations.repository';
import { ListConversationsService } from './services/list-conversations.service';
import { ListMessagesService } from './services/list-messages.service';

@Module({
  controllers: [ConversationsController],
  providers: [
    ListConversationsService,
    ListMessagesService,
    ConversationsRepository,
    AuthGuard,
  ],
})
export class ConversationsModule {}
