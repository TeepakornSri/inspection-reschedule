import { PrismaService } from '../models/prisma.service';
export declare class EquipmentService {
    private prisma;
    constructor(prisma: PrismaService);
    getAll(): Promise<{
        next_due_date: string;
        id: number;
        tag_no: string;
        name: string;
        location: string;
        criticality: string;
    }[]>;
}
