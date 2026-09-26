import { Module } from '@nestjs/common';
import { EquipmentController } from '../controllers/equipment.controller';
import { EquipmentService } from '../services/equipment.service';
import { PrismaService } from '../models/prisma.service';

@Module({
  controllers: [EquipmentController],
  providers: [EquipmentService, PrismaService],
})
export class EquipmentModule {}
