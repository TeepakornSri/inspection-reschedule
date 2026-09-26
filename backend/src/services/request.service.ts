import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { app_user } from '@prisma/client';
import { PrismaService } from '../models/prisma.service';
import { checkNeedManager } from '../utils/policy';

export type CreateRequestBody = {
  equipment_id: number;
  new_due_date: string;
  reason: string;
};

@Injectable()
export class RequestService {
  constructor(private prisma: PrismaService) {}

  async create(user: app_user, body: CreateRequestBody) {
    const { equipment_id, new_due_date, reason } = body;

    console.log('[ยื่นคำขอ] ผู้ใช้:', user.username, '| ข้อมูล:', body);

    if (!equipment_id || !new_due_date || !reason) {
      console.log('[ยื่นคำขอ] ไม่สำเร็จ: ข้อมูลไม่ครบ');
      throw new BadRequestException('กรุณากรอกข้อมูลให้ครบ');
    }

    const equipment = await this.prisma.equipment.findUnique({
      where: { id: Number(equipment_id) },
    });

    if (!equipment) {
      console.log('[ยื่นคำขอ] ไม่สำเร็จ: ไม่พบอุปกรณ์', equipment_id);
      throw new NotFoundException('ไม่พบอุปกรณ์');
    }

    const newDueDate = new Date(new_due_date);

    if (isNaN(newDueDate.getTime())) {
      console.log('[ยื่นคำขอ] ไม่สำเร็จ: รูปแบบวันที่ไม่ถูกต้อง', new_due_date);
      throw new BadRequestException('รูปแบบวันที่ไม่ถูกต้อง');
    }

    if (newDueDate <= equipment.next_due_date) {
      console.log('[ยื่นคำขอ] ไม่สำเร็จ: วันที่ใหม่ไม่มากกว่ากำหนดเดิม');
      throw new BadRequestException('วันที่ใหม่ต้องมากกว่ากำหนดตรวจเดิม');
    }

    const pending = await this.prisma.deferral_request.findFirst({
      where: { equipment_id: equipment.id, status: 'P' },
    });

    if (pending) {
      console.log('[ยื่นคำขอ] ไม่สำเร็จ: มีคำขอค้างอยู่แล้ว id', pending.id);
      throw new BadRequestException('อุปกรณ์นี้มีคำขอที่รออนุมัติอยู่แล้ว');
    }

    const approved = await this.prisma.deferral_request.findMany({
      where: { equipment_id: equipment.id, status: 'A' },
      orderBy: { create_date: 'asc' },
    });

    const originalDueDate =
      approved.length > 0 ? approved[0].old_due_date : equipment.next_due_date;

    const needManager = checkNeedManager(
      equipment.criticality,
      originalDueDate,
      newDueDate,
      approved.length,
    );

    const result = await this.prisma.deferral_request.create({
      data: {
        equipment_id: equipment.id,
        old_due_date: equipment.next_due_date,
        new_due_date: newDueDate,
        reason,
        need_manager: needManager ? 'Y' : 'N',
        status: 'P',
        create_by: user.id,
      },
    });

    console.log(
      '[ยื่นคำขอ] สำเร็จ id:',
      result.id,
      '| อุปกรณ์:',
      equipment.tag_no,
      '| ระดับ:',
      equipment.criticality,
      '| เคยเลื่อน:',
      approved.length,
      'ครั้ง',
      '| ต้องให้ผู้จัดการอนุมัติ:',
      needManager ? 'ใช่' : 'ไม่',
    );

    return result;
  }
}
