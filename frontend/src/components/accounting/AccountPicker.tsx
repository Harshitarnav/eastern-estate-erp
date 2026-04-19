'use client';

import * as React from 'react';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Account } from '@/services/accounting.service';

/**
 * Tally-style searchable account picker.
 *
 * Why:
 *  - Accountants type the account code or first word of the name;
 *    a native <select> can't scroll hundreds of accounts effectively.
 *  - Keeps a small "recently used" list per pickerScope (localStorage)
 *    so repeat entries feel fast.
 *
 * Accepted filters:
 *  - allowedTypes: restrict to ASSET / INCOME etc (quick vouchers need this).
 *  - onlyActive: defaults to true; pass false to show archived.
 */

type PickerScope =
  | 'je-line'
  | 'voucher-dr'
  | 'voucher-cr'
  | 'bulk-line'
  | 'bank-match'
  | string;

const RECENT_MAX = 5;
const RECENT_KEY = (scope: PickerScope) => `ee-account-picker-recent-v1:${scope}`;

function readRecent(scope: PickerScope): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY(scope));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeRecent(scope: PickerScope, ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(RECENT_KEY(scope), JSON.stringify(ids.slice(0, RECENT_MAX)));
  } catch {
    /* ignore quota */
  }
}

export function pushRecentAccount(scope: PickerScope, accountId: string) {
  if (!accountId) return;
  const prev = readRecent(scope);
  const next = [accountId, ...prev.filter((id) => id !== accountId)].slice(0, RECENT_MAX);
  writeRecent(scope, next);
}

const TYPE_ORDER: Account['accountType'][] = [
  'ASSET',
  'LIABILITY',
  'EQUITY',
  'INCOME',
  'EXPENSE',
];

const TYPE_LABEL: Record<Account['accountType'], string> = {
  ASSET: 'Assets',
  LIABILITY: 'Liabilities',
  EQUITY: 'Equity',
  INCOME: 'Income',
  EXPENSE: 'Expenses',
};

export interface AccountPickerProps {
  accounts: Account[];
  value: string;
  onChange: (accountId: string) => void;
  /** When set, only accounts of these types are offered. */
  allowedTypes?: Account['accountType'][];
  /** Defaults true; pass false to include inactive accounts. */
  onlyActive?: boolean;
  /** Persists recent selections per-scope. Use 'voucher-dr', 'voucher-cr', 'je-line' etc. */
  pickerScope?: PickerScope;
  /** Placeholder shown when no account chosen. */
  placeholder?: string;
  /** Sizes for dense grid use. */
  size?: 'sm' | 'md';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  /** Triggered when the popover closes; useful for advancing focus in a grid. */
  onClose?: () => void;
  /** Shown above the list, e.g. "From your chart for Project A". */
  hint?: string;
  /** Auto-focuses the trigger on mount (useful when a new row is added). */
  autoFocus?: boolean;
}

export const AccountPicker = React.forwardRef<HTMLButtonElement, AccountPickerProps>(
  function AccountPicker(
    {
      accounts,
      value,
      onChange,
      allowedTypes,
      onlyActive = true,
      pickerScope = 'je-line',
      placeholder = 'Search account…',
      size = 'md',
      disabled,
      loading,
      className,
      onClose,
      hint,
      autoFocus,
    },
    ref,
  ) {
    const [open, setOpen] = React.useState(false);

    const filtered = React.useMemo(() => {
      return accounts.filter((a) => {
        if (onlyActive && !a.isActive) return false;
        if (allowedTypes && allowedTypes.length && !allowedTypes.includes(a.accountType)) return false;
        return true;
      });
    }, [accounts, allowedTypes, onlyActive]);

    const byId = React.useMemo(() => {
      const m = new Map<string, Account>();
      for (const a of filtered) m.set(a.id, a);
      return m;
    }, [filtered]);

    const grouped = React.useMemo(() => {
      const map = new Map<Account['accountType'], Account[]>();
      for (const a of filtered) {
        const arr = map.get(a.accountType) ?? [];
        arr.push(a);
        map.set(a.accountType, arr);
      }
      for (const [, arr] of map) {
        arr.sort((x, y) => (x.accountCode || '').localeCompare(y.accountCode || ''));
      }
      return map;
    }, [filtered]);

    const [recentIds, setRecentIds] = React.useState<string[]>([]);
    React.useEffect(() => {
      if (open) setRecentIds(readRecent(pickerScope));
    }, [open, pickerScope]);

    const recentAccounts = React.useMemo(() => {
      const out: Account[] = [];
      for (const id of recentIds) {
        const a = byId.get(id);
        if (a) out.push(a);
      }
      return out;
    }, [recentIds, byId]);

    const selected = value ? byId.get(value) : undefined;
    const triggerLabel = selected
      ? `${selected.accountCode} - ${selected.accountName}`
      : placeholder;

    const handleSelect = (accountId: string) => {
      onChange(accountId);
      pushRecentAccount(pickerScope, accountId);
      setOpen(false);
      onClose?.();
    };

    return (
      <Popover
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) onClose?.();
        }}
      >
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            autoFocus={autoFocus}
            disabled={disabled || loading}
            className={cn(
              'flex w-full items-center justify-between gap-2 rounded border bg-white text-left transition-colors',
              'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#A8211B]/20 focus:border-[#A8211B]/40',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              size === 'sm' ? 'px-2 py-1 text-xs h-8' : 'px-3 py-2 text-sm h-10',
              !selected && 'text-gray-500',
              className,
            )}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span className="truncate">
              {loading ? (
                <span className="flex items-center gap-1 text-gray-400">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading accounts…
                </span>
              ) : (
                triggerLabel
              )}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(420px,calc(100vw-1rem))] p-0" align="start">
          <Command
            filter={(itemValue, search) => {
              // itemValue = "accountCode accountName accountType"
              const hay = itemValue.toLowerCase();
              const needles = search.toLowerCase().split(/\s+/).filter(Boolean);
              return needles.every((n) => hay.includes(n)) ? 1 : 0;
            }}
          >
            <CommandInput placeholder="Type code or name…" />
            {hint && (
              <div className="px-3 py-1 text-[10px] uppercase tracking-wide text-gray-400 border-b">
                {hint}
              </div>
            )}
            <CommandList className="max-h-[320px]">
              <CommandEmpty>No matching accounts.</CommandEmpty>

              {recentAccounts.length > 0 && (
                <>
                  <CommandGroup heading="Recently used">
                    {recentAccounts.map((a) => (
                      <CommandItem
                        key={`recent-${a.id}`}
                        value={`${a.accountCode} ${a.accountName} ${a.accountType}`}
                        onSelect={() => handleSelect(a.id)}
                        className="flex items-center gap-2"
                      >
                        <span className="font-mono text-xs text-gray-500 shrink-0">
                          {a.accountCode}
                        </span>
                        <span className="truncate">{a.accountName}</span>
                        <span className="ml-auto text-[10px] uppercase tracking-wide text-gray-400">
                          {a.accountType}
                        </span>
                        {value === a.id && (
                          <Check className="h-3.5 w-3.5 text-[#A8211B] shrink-0" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {TYPE_ORDER.map((type) => {
                const items = grouped.get(type);
                if (!items || items.length === 0) return null;
                return (
                  <CommandGroup key={type} heading={TYPE_LABEL[type]}>
                    {items.map((a) => (
                      <CommandItem
                        key={a.id}
                        value={`${a.accountCode} ${a.accountName} ${a.accountType}`}
                        onSelect={() => handleSelect(a.id)}
                        className="flex items-center gap-2"
                      >
                        <span className="font-mono text-xs text-gray-500 shrink-0">
                          {a.accountCode}
                        </span>
                        <span className="truncate">{a.accountName}</span>
                        {value === a.id && (
                          <Check className="h-3.5 w-3.5 text-[#A8211B] ml-auto shrink-0" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

export default AccountPicker;
