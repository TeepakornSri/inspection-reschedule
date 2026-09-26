import { app_user } from '@prisma/client';
import { PrismaService } from '../models/prisma.service';
export type CreateRequestBody = {
    equipment_id: number;
    new_due_date: string;
    reason: string;
};
export declare class RequestService {
    private prisma;
    constructor(prisma: PrismaService);
    create(user: app_user, body: CreateRequestBody): Promise<{
        id: number;
        equipment_id: number;
        new_due_date: Date;
        reason: string;
        old_due_date: Date;
        need_manager: string;
        status: string;
        create_date: Date;
        create_by: number;
        modify_date: Date | null;
        modify_by: number | null;
    }>;
}
