import { Module } from '@nestjs/common';
import { RequestController } from '../controllers/request.controller';
import { RequestService } from '../services/request.service';
import { PrismaService } from '../models/prisma.service';

@Module({
  controllers: [RequestController],
  providers: [RequestService, PrismaService],
})
export class RequestModule {}
