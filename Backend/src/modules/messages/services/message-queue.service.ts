import { Injectable, OnModuleInit } from '@nestjs/common';
import { MessagePriority } from '@prisma/client';
import { MessagesRepository } from '../repositories/messages.repository';

@Injectable()
export class MessageQueueService implements OnModuleInit {
  private readonly urgentQueue: string[] = [];
  private readonly normalQueue: string[] = [];

  constructor(private readonly messagesRepository: MessagesRepository) {}

  async onModuleInit() {
    await this.hydrate();
  }

  async hydrate() {
    this.urgentQueue.length = 0;
    this.normalQueue.length = 0;

    await this.messagesRepository.resetProcessingMessages();

    const pendingMessages = await this.messagesRepository.findQueuedMessages();

    for (const message of pendingMessages) {
      this.enqueueInternal(message.id, message.priority);
    }
  }

  enqueue(messageId: string, priority: MessagePriority) {
    this.enqueueInternal(messageId, priority);
  }

  dequeue(): string | undefined {
    if (this.urgentQueue.length > 0) {
      return this.urgentQueue.shift();
    }
    return this.normalQueue.shift();
  }

  getQueueSizes() {
    return {
      urgent: this.urgentQueue.length,
      normal: this.normalQueue.length,
    };
  }

  private enqueueInternal(messageId: string, priority: MessagePriority) {
    const queue =
      priority === MessagePriority.urgent
        ? this.urgentQueue
        : this.normalQueue;

    if (!queue.includes(messageId)) {
      queue.push(messageId);
    }
  }
}
