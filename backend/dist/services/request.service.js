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
    async getPending() {
        const requests = await this.prisma.deferral_request.findMany({
            where: { status: 'P' },
            include: { equipment: true },
            orderBy: { create_date: 'asc' },
        });
        const approved = await this.prisma.deferral_request.findMany({
            where: { status: 'A' },
        });
        const users = await this.prisma.app_user.findMany();
        return requests.map((item) => ({
            id: item.id,
            tag_no: item.equipment.tag_no,
            equipment_name: item.equipment.name,
            location: item.equipment.location,
            criticality: item.equipment.criticality,
            old_due_date: item.old_due_date.toISOString().slice(0, 10),
            new_due_date: item.new_due_date.toISOString().slice(0, 10),
            reason: item.reason,
            need_manager: item.need_manager,
            attempt: approved.filter((a) => a.equipment_id === item.equipment_id).length + 1,
            create_by: item.create_by,
            create_by_name: users.find((u) => u.id === item.create_by)?.full_name || '-',
            create_date: item.create_date,
        }));
    }
    async getHistory() {
        const requests = await this.prisma.deferral_request.findMany({
            where: { status: { in: ['A', 'R'] } },
            include: { equipment: true },
            orderBy: { modify_date: 'desc' },
        });
        const users = await this.prisma.app_user.findMany();
        return requests.map((item) => ({
            id: item.id,
            tag_no: item.equipment.tag_no,
            equipment_name: item.equipment.name,
            location: item.equipment.location,
            criticality: item.equipment.criticality,
            old_due_date: item.old_due_date.toISOString().slice(0, 10),
            new_due_date: item.new_due_date.toISOString().slice(0, 10),
            reason: item.reason,
            need_manager: item.need_manager,
            status: item.status,
            create_by_name: users.find((u) => u.id === item.create_by)?.full_name || '-',
            create_date: item.create_date,
            modify_by_name: users.find((u) => u.id === item.modify_by)?.full_name || '-',
            modify_date: item.modify_date,
        }));
    }
    async approve(user, id) {
        console.log('[อนุมัติ] ผู้ใช้:', user.username, '| คำขอ id:', id);
        const request = await this.findPendingRequest(id);
        this.checkCanReview(user, request);
        const [result] = await this.prisma.$transaction([
            this.prisma.deferral_request.update({
                where: { id },
                data: { status: 'A', modify_by: user.id, modify_date: new Date() },
            }),
            this.prisma.equipment.update({
                where: { id: request.equipment_id },
                data: { next_due_date: request.new_due_date },
            }),
        ]);
        console.log('[อนุมัติ] สำเร็จ id:', id, '| กำหนดตรวจใหม่:', request.new_due_date.toISOString().slice(0, 10));
        return result;
    }
    async reject(user, id) {
        console.log('[ปฏิเสธ] ผู้ใช้:', user.username, '| คำขอ id:', id);
        const request = await this.findPendingRequest(id);
        this.checkCanReview(user, request);
        const result = await this.prisma.deferral_request.update({
            where: { id },
            data: { status: 'R', modify_by: user.id, modify_date: new Date() },
        });
        console.log('[ปฏิเสธ] สำเร็จ id:', id);
        return result;
    }
    async findPendingRequest(id) {
        const request = await this.prisma.deferral_request.findUnique({
            where: { id },
        });
        if (!request) {
            console.log('ไม่สำเร็จ: ไม่พบคำขอ id', id);
            throw new common_1.NotFoundException('ไม่พบคำขอ');
        }
        if (request.status !== 'P') {
            console.log('ไม่สำเร็จ: คำขอถูกดำเนินการไปแล้ว status', request.status);
            throw new common_1.BadRequestException('คำขอนี้ถูกดำเนินการไปแล้ว');
        }
        return request;
    }
    checkCanReview(user, request) {
        if (user.role === 'requester') {
            console.log('ไม่สำเร็จ: requester ไม่มีสิทธิ์อนุมัติ');
            throw new common_1.ForbiddenException('ไม่มีสิทธิ์อนุมัติ');
        }
        if (request.create_by === user.id && user.role !== 'department_manager') {
            console.log('ไม่สำเร็จ: หัวหน้างานอนุมัติคำขอของตัวเอง');
            throw new common_1.ForbiddenException('ไม่สามารถอนุมัติคำขอของตัวเองได้');
        }
        if (request.need_manager === 'Y' && user.role !== 'department_manager') {
            console.log('ไม่สำเร็จ: คำขอนี้ต้องให้ผู้จัดการฝ่ายอนุมัติ');
            throw new common_1.ForbiddenException('คำขอนี้ต้องให้ผู้จัดการฝ่ายอนุมัติ');
        }
    }
};
exports.RequestService = RequestService;
exports.RequestService = RequestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RequestService);
//# sourceMappingURL=request.service.js.map