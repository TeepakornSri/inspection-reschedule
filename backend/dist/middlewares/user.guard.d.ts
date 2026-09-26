import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { app_user } from '@prisma/client';
import { PrismaService } from '../models/prisma.service';
export type RequestWithUser = Request & {
    user: app_user;
};
export declare class UserGuard implements CanActivate {
    private prisma;
    constructor(prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
