type ReqScope = {
    isGlobalAdmin?: boolean;
    accessiblePropertyIds?: string[] | null;
};
export declare function assertExpenseReadable(expense: {
    propertyId?: string | null;
}, req: ReqScope): void;
export declare function assertAccountReadable(account: {
    propertyId?: string | null;
}, req: ReqScope): void;
export declare function assertBankAccountReadable(ba: {
    propertyId?: string | null;
}, req: ReqScope): void;
export declare function assertJournalEntryReadable(entry: {
    lines?: Array<{
        account?: {
            propertyId?: string | null;
        };
    }>;
}, req: ReqScope): void;
export declare function resolveAccountingPropertyScope(req: ReqScope, propertyId?: string): string | undefined;
export type AccountingReportScope = {
    kind: 'single';
    propertyId: string;
} | {
    kind: 'consolidated';
    restrictJournalPropertyIds: string[] | null;
};
export declare function resolveAccountingReportScope(req: ReqScope, propertyId?: string): AccountingReportScope;
export declare function accessiblePropertyIdsOrThrow(req: ReqScope): string[] | null;
export {};
