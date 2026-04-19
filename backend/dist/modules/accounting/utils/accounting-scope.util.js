"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertExpenseReadable = assertExpenseReadable;
exports.assertAccountReadable = assertAccountReadable;
exports.assertBankAccountReadable = assertBankAccountReadable;
exports.assertJournalEntryReadable = assertJournalEntryReadable;
exports.resolveAccountingPropertyScope = resolveAccountingPropertyScope;
exports.resolveAccountingReportScope = resolveAccountingReportScope;
exports.accessiblePropertyIdsOrThrow = accessiblePropertyIdsOrThrow;
const common_1 = require("@nestjs/common");
function assertExpenseReadable(expense, req) {
    if (req.isGlobalAdmin)
        return;
    const ids = req.accessiblePropertyIds || [];
    if (!ids.length) {
        throw new common_1.ForbiddenException('You have not been assigned to any projects yet.');
    }
    const pid = expense.propertyId;
    if (pid == null || pid === '')
        return;
    if (!ids.includes(pid)) {
        throw new common_1.ForbiddenException('You do not have access to this expense');
    }
}
function assertAccountReadable(account, req) {
    if (req.isGlobalAdmin)
        return;
    const ids = req.accessiblePropertyIds || [];
    if (!ids.length) {
        throw new common_1.ForbiddenException('You have not been assigned to any projects yet.');
    }
    const pid = account.propertyId;
    if (pid == null || pid === '')
        return;
    if (!ids.includes(pid)) {
        throw new common_1.ForbiddenException('You do not have access to this account');
    }
}
function assertBankAccountReadable(ba, req) {
    assertAccountReadable(ba, req);
}
function assertJournalEntryReadable(entry, req) {
    if (req.isGlobalAdmin)
        return;
    const ids = req.accessiblePropertyIds || [];
    if (!ids.length) {
        throw new common_1.ForbiddenException('You have not been assigned to any projects yet.');
    }
    for (const line of entry.lines || []) {
        const pid = line.account?.propertyId;
        if (pid == null || pid === '')
            continue;
        if (!ids.includes(pid)) {
            throw new common_1.ForbiddenException('You do not have access to this journal entry');
        }
    }
}
function resolveAccountingPropertyScope(req, propertyId) {
    if (req.isGlobalAdmin) {
        return propertyId;
    }
    const ids = req.accessiblePropertyIds || [];
    if (!ids.length) {
        throw new common_1.ForbiddenException('You have not been assigned to any projects yet.');
    }
    if (propertyId) {
        if (!ids.includes(propertyId)) {
            throw new common_1.ForbiddenException('You do not have access to this project');
        }
        return propertyId;
    }
    if (ids.length === 1) {
        return ids[0];
    }
    throw new common_1.BadRequestException('propertyId is required when you have access to more than one project');
}
function resolveAccountingReportScope(req, propertyId) {
    if (propertyId) {
        if (!req.isGlobalAdmin) {
            const ids = req.accessiblePropertyIds || [];
            if (!ids.length) {
                throw new common_1.ForbiddenException('You have not been assigned to any projects yet.');
            }
            if (!ids.includes(propertyId)) {
                throw new common_1.ForbiddenException('You do not have access to this project');
            }
        }
        return { kind: 'single', propertyId };
    }
    if (req.isGlobalAdmin) {
        return { kind: 'consolidated', restrictJournalPropertyIds: null };
    }
    const ids = req.accessiblePropertyIds || [];
    if (!ids.length) {
        throw new common_1.ForbiddenException('You have not been assigned to any projects yet.');
    }
    return { kind: 'consolidated', restrictJournalPropertyIds: ids };
}
function accessiblePropertyIdsOrThrow(req) {
    if (req.isGlobalAdmin) {
        return null;
    }
    const ids = req.accessiblePropertyIds || [];
    if (!ids.length) {
        throw new common_1.ForbiddenException('You have not been assigned to any projects yet.');
    }
    return ids;
}
//# sourceMappingURL=accounting-scope.util.js.map