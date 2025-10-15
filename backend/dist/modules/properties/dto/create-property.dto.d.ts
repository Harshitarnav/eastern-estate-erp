export declare class CreatePropertyDto {
    propertyCode: string;
    name: string;
    description?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
    totalArea?: number;
    areaUnit?: string;
    launchDate?: string;
    expectedCompletionDate?: string;
    actualCompletionDate?: string;
    reraNumber?: string;
    projectType?: string;
    status?: string;
    images?: string[];
    documents?: any[];
    amenities?: string[];
    isActive?: boolean;
}
