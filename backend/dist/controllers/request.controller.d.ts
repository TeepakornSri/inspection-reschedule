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
}
