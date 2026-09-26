import { EquipmentService } from '../services/equipment.service';
export declare class EquipmentController {
    private equipmentService;
    constructor(equipmentService: EquipmentService);
    getAll(): Promise<{
        next_due_date: string;
        id: number;
        tag_no: string;
        name: string;
        location: string;
        criticality: string;
    }[]>;
}
