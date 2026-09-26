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
    getPending(): Promise<{
        id: number;
        tag_no: string;
        equipment_name: string;
        location: string;
        criticality: string;
        old_due_date: string;
        new_due_date: string;
        reason: string;
        need_manager: string;
        attempt: number;
        create_by: number;
        create_by_name: string;
        create_date: Date;
    }[]>;
    getHistory(): Promise<{
        id: number;
        tag_no: string;
        equipment_name: string;
        location: string;
        criticality: string;
        old_due_date: string;
        new_due_date: string;
        reason: string;
        need_manager: string;
        status: string;
        create_by_name: string;
        create_date: Date;
        modify_by_name: string;
        modify_date: Date | null;
    }[]>;
    approve(user: app_user, id: number): Promise<{
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
    reject(user: app_user, id: number): Promise<{
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
    private findPendingRequest;
    private checkCanReview;
}
