import { Injectable } from '@nestjs/common';
import { PrismaService } from '../models/prisma.service';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const equipment = await this.prisma.equipment.findMany({
      orderBy: { id: 'asc' },
    });

    return equipment.map((item) => ({
      ...item,
      next_due_date: item.next_due_date.toISOString().slice(0, 10),
    }));
  }
}
