import { RequestService } from '../services/request.service';
import type { CreateRequestBody } from '../services/request.service';
import type { RequestWithUser } from '../middlewares/user.guard';
export declare class RequestController {
    private requestService;
    constructor(requestService: RequestService);
    create(req: RequestWithUser, body: CreateRequestBody): Promise<{
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
    approve(req: RequestWithUser, id: number): Promise<{
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
    reject(req: RequestWithUser, id: number): Promise<{
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
