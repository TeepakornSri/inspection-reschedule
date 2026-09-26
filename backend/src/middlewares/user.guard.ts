import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { app_user } from '@prisma/client';
import { PrismaService } from '../models/prisma.service';

export type RequestWithUser = Request & { user: app_user };

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = Number(req.headers['x-user-id']);

    if (!userId) {
      throw new UnauthorizedException('ไม่พบ X-User-Id');
    }

    const user = await this.prisma.app_user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('ไม่พบผู้ใช้');
    }

    req.user = user;
    return true;
  }
}
