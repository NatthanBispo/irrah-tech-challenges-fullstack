import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      client?: unknown;
    }>();

    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException(this.i18n.t('auth.UNAUTHORIZED'));
    }

    const token = authorization.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException(this.i18n.t('auth.UNAUTHORIZED'));
    }

    const client = await this.prisma.client.findFirst({
      where: { id: token, active: true },
    });

    if (!client) {
      throw new UnauthorizedException(this.i18n.t('auth.UNAUTHORIZED'));
    }

    request.client = client;
    return true;
  }
}
