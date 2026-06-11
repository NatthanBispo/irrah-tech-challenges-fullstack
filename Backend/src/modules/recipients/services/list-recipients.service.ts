import { Injectable } from '@nestjs/common';
import { RecipientEntity } from '../entities/recipient.entity';
import { RecipientsRepository } from '../repositories/recipients.repository';

@Injectable()
export class ListRecipientsService {
  constructor(private readonly recipientsRepository: RecipientsRepository) {}

  async execute(): Promise<RecipientEntity[]> {
    const recipients = await this.recipientsRepository.findAll();

    return recipients.map((recipient) => ({
      id: recipient.id,
      name: recipient.name,
    }));
  }
}
