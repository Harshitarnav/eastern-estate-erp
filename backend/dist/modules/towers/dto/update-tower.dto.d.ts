import { CreateTowerDto } from './create-tower.dto';
declare const UpdateTowerDto_base: import("@nestjs/common").Type<Partial<Omit<CreateTowerDto, "propertyId">>>;
export declare class UpdateTowerDto extends UpdateTowerDto_base {
    isActive?: boolean;
}
export {};
