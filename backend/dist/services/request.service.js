"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../models/prisma.service");
const policy_1 = require("../utils/policy");
let RequestService = class RequestService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(user, body) {
        const { equipment_id, new_due_date, reason } = body;
        console.log('[ยื่นคำขอ] ผู้ใช้:', user.username, '| ข้อมูล:', body);
        if (!equipment_id || !new_due_date || !reason) {
            console.log('[ยื่นคำขอ] ไม่สำเร็จ: ข้อมูลไม่ครบ');
            throw new common_1.BadRequestException('กรุณากรอกข้อมูลให้ครบ');
        }
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: Number(equipment_id) },
        });
        if (!equipment) {
            console.log('[ยื่นคำขอ] ไม่สำเร็จ: ไม่พบอุปกรณ์', equipment_id);
            throw new common_1.NotFoundException('ไม่พบอุปกรณ์');
        }
        const newDueDate = new Date(new_due_date);
        if (isNaN(newDueDate.getTime())) {
            console.log('[ยื่นคำขอ] ไม่สำเร็จ: รูปแบบวันที่ไม่ถูกต้อง', new_due_date);
            throw new common_1.BadRequestException('รูปแบบวันที่ไม่ถูกต้อง');
        }
        if (newDueDate <= equipment.next_due_date) {
            console.log('[ยื่นคำขอ] ไม่สำเร็จ: วันที่ใหม่ไม่มากกว่ากำหนดเดิม');
            throw new common_1.BadRequestException('วันที่ใหม่ต้องมากกว่ากำหนดตรวจเดิม');
        }
        const pending = await this.prisma.deferral_request.findFirst({
            where: { equipment_id: equipment.id, status: 'P' },
        });
        if (pending) {
            console.log('[ยื่นคำขอ] ไม่สำเร็จ: มีคำขอค้างอยู่แล้ว id', pending.id);
            throw new common_1.BadRequestException('อุปกรณ์นี้มีคำขอที่รออนุมัติอยู่แล้ว');
        }
        const approved = await this.prisma.deferral_request.findMany({
            where: { equipment_id: equipment.id, status: 'A' },
            orderBy: { create_date: 'asc' },
        });
        const originalDueDate = approved.length > 0 ? approved[0].old_due_date : equipment.next_due_date;
        const needManager = (0, policy_1.checkNeedManager)(equipment.criticality, originalDueDate, newDueDate, approved.length);
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
        console.log('[ยื่นคำขอ] สำเร็จ id:', result.id, '| อุปกรณ์:', equipment.tag_no, '| ระดับ:', equipment.criticality, '| เคยเลื่อน:', approved.length, 'ครั้ง', '| ต้องให้ผู้จัดการอนุมัติ:', needManager ? 'ใช่' : 'ไม่');
        return result;
    }
};
exports.RequestService = RequestService;
exports.RequestService = RequestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RequestService);
//# sourceMappingURL=request.service.js.map