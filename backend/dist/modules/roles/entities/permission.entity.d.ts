export declare class Permission {
    id: string;
    module: string;
    action: string;
    resource: string;
    description: string;
    createdAt: Date;
    get name(): string;
}
