import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Client } from '@prisma/client';

export const CurrentClient = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Client => {
    const request = ctx.switchToHttp().getRequest<{ client: Client }>();
    return request.client;
  },
);
