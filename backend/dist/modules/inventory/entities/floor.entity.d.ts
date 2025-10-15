import { Tower } from './tower.entity';
import { Flat } from './flat.entity';
export declare class Floor {
    id: string;
    tower: Tower;
    floorNumber: number;
    floorName: string;
    totalFlats: number;
    flats: Flat[];
    createdAt: Date;
}
