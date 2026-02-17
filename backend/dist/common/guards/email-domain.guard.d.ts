import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class EmailDomainGuard implements CanActivate {
    private readonly logger;
    private readonly allowedDomain;
    canActivate(context: ExecutionContext): boolean;
}
