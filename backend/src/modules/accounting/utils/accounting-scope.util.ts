import { BadRequestException, ForbiddenException } from '@nestjs/common';

type ReqScope = { isGlobalAdmin?: boolean; accessiblePropertyIds?: string[] | null };

export function assertExpenseReadable(
  expense: { propertyId?: string | null },
  req: ReqScope,
): void {
  if (req.isGlobalAdmin) return;
  const ids = req.accessiblePropertyIds || [];
  if (!ids.length) {
    throw new ForbiddenException('You have not been assigned to any projects yet.');
  }
  const pid = expense.propertyId;
  if (pid == null || pid === '') return;
  if (!ids.includes(pid)) {
    throw new ForbiddenException('You do not have access to this expense');
  }
}

export function assertAccountReadable(account: { propertyId?: string | null }, req: ReqScope): void {
  if (req.isGlobalAdmin) return;
  const ids = req.accessiblePropertyIds || [];
  if (!ids.length) {
    throw new ForbiddenException('You have not been assigned to any projects yet.');
  }
  const pid = account.propertyId;
  if (pid == null || pid === '') return;
  if (!ids.includes(pid)) {
    throw new ForbiddenException('You do not have access to this account');
  }
}

export function assertBankAccountReadable(ba: { propertyId?: string | null }, req: ReqScope): void {
  assertAccountReadable(ba, req);
}

export function assertJournalEntryReadable(
  entry: { lines?: Array<{ account?: { propertyId?: string | null } }> },
  req: ReqScope,
): void {
  if (req.isGlobalAdmin) return;
  const ids = req.accessiblePropertyIds || [];
  if (!ids.length) {
    throw new ForbiddenException('You have not been assigned to any projects yet.');
  }
  for (const line of entry.lines || []) {
    const pid = line.account?.propertyId;
    if (pid == null || pid === '') continue;
    if (!ids.includes(pid)) {
      throw new ForbiddenException('You do not have access to this journal entry');
    }
  }
}

/**
 * Resolve propertyId for accounting reads when the user is project-scoped.
 * - Global admin / head accountant: pass through optional propertyId from query.
 * - Single assigned project: default to that id when propertyId omitted.
 * - Multiple assignments: require explicit propertyId.
 */
export function resolveAccountingPropertyScope(req: ReqScope, propertyId?: string): string | undefined {
  if (req.isGlobalAdmin) {
    return propertyId;
  }
  const ids = req.accessiblePropertyIds || [];
  if (!ids.length) {
    throw new ForbiddenException('You have not been assigned to any projects yet.');
  }
  if (propertyId) {
    if (!ids.includes(propertyId)) {
      throw new ForbiddenException('You do not have access to this project');
    }
    return propertyId;
  }
  if (ids.length === 1) {
    return ids[0];
  }
  throw new BadRequestException(
    'propertyId is required when you have access to more than one project',
  );
}

/** For list endpoints: optional explicit propertyId, else restrict to accessible ids (and optional null rows). */
export function accessiblePropertyIdsOrThrow(req: ReqScope): string[] | null {
  if (req.isGlobalAdmin) {
    return null;
  }
  const ids = req.accessiblePropertyIds || [];
  if (!ids.length) {
    throw new ForbiddenException('You have not been assigned to any projects yet.');
  }
  return ids;
}
