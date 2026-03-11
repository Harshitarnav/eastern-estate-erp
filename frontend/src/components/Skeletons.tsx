/**
 * Skeletons.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable skeleton loading components for every major page layout.
 * Import the one that matches your page's actual UI to avoid layout shift
 * and the "blank page" effect while data loads.
 *
 * Exports
 * ───────
 *  TableSkeleton       – List / table pages (bookings, payments, leads…)
 *  CardGridSkeleton    – Card grid pages (customers, employees, properties…)
 *  DetailSkeleton      – Single-item detail pages with header + sections
 *  DashboardSkeleton   – Dashboard with KPI cards, charts, tables
 *  FormSkeleton        – New / edit form pages
 *  SectionSkeleton     – Generic white card with n rows (composable helper)
 */

// ── Base pulse wrapper ───────────────────────────────────────────────────────
function Pulse({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`animate-pulse ${className}`}>{children}</div>;
}

// ── Generic grey box ─────────────────────────────────────────────────────────
function Box({ w = 'w-full', h = 'h-4', rounded = 'rounded', className = '' }: {
  w?: string; h?: string; rounded?: string; className?: string;
}) {
  return <div className={`bg-gray-200 ${w} ${h} ${rounded} ${className}`} />;
}

// ── Small / medium / large label rows ───────────────────────────────────────
function LabelRow() {
  return (
    <div>
      <Box w="w-1/3" h="h-3" className="mb-1.5" />
      <Box w="w-2/3" h="h-4" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. TableSkeleton
//    Use for pages that render a list of rows / large cards (bookings, payments…)
// ─────────────────────────────────────────────────────────────────────────────
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Pulse className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          {/* top row */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 flex-1">
              <Box w="w-28" h="h-5" />
              <Box w="w-16" h="h-5" rounded="rounded-full" />
            </div>
            <Box w="w-24" h="h-5" />
          </div>
          {/* detail grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {Array.from({ length: 4 }).map((_, j) => <LabelRow key={j} />)}
          </div>
          {/* progress / action row */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-4">
            <Box w="w-full" h="h-2" rounded="rounded-full" />
            <Box w="w-24" h="h-9" rounded="rounded-xl" className="flex-shrink-0" />
          </div>
        </div>
      ))}
    </Pulse>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CardGridSkeleton
//    Use for card-grid pages (customers, employees, marketing, properties…)
// ─────────────────────────────────────────────────────────────────────────────
export function CardGridSkeleton({
  cards = 8,
  columns = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}: {
  cards?: number;
  columns?: string;
}) {
  return (
    <Pulse className={`grid ${columns} gap-6`}>
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* header strip */}
          <div className="bg-gray-100 p-4 flex items-center gap-3">
            <Box w="w-12" h="h-12" rounded="rounded-full" className="flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Box w="w-3/4" h="h-4" />
              <Box w="w-1/2" h="h-3" />
            </div>
          </div>
          {/* body */}
          <div className="p-4 space-y-3">
            <Box w="w-1/3" h="h-5" rounded="rounded-full" />
            <Box w="w-full" h="h-3" />
            <Box w="w-5/6" h="h-3" />
            <Box w="w-4/6" h="h-3" />
            {/* footer strip */}
            <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
              <div>
                <Box w="w-3/4" h="h-3" className="mb-1" />
                <Box w="w-1/2" h="h-4" />
              </div>
              <div>
                <Box w="w-3/4" h="h-3" className="mb-1" />
                <Box w="w-2/3" h="h-4" />
              </div>
            </div>
            <Box w="w-full" h="h-9" rounded="rounded-xl" />
          </div>
        </div>
      ))}
    </Pulse>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DetailSkeleton
//    Use for [id]/page.tsx detail views – matches: header, main sections, sidebar
// ─────────────────────────────────────────────────────────────────────────────
export function DetailSkeleton({ sidebar = true }: { sidebar?: boolean }) {
  return (
    <Pulse className="p-6">
      {/* back + header */}
      <Box w="w-36" h="h-5" className="mb-6" />
      <div className="flex items-start justify-between gap-6 mb-8">
        <div className="flex items-start gap-5">
          <Box w="w-20" h="h-20" rounded="rounded-full" className="flex-shrink-0" />
          <div className="space-y-2 pt-1">
            <Box w="w-56" h="h-7" />
            <Box w="w-32" h="h-4" />
            <div className="flex gap-2">
              <Box w="w-24" h="h-6" rounded="rounded-full" />
              <Box w="w-20" h="h-6" rounded="rounded-full" />
            </div>
          </div>
        </div>
        <Box w="w-36" h="h-10" rounded="rounded-lg" />
      </div>

      {/* content grid */}
      <div className={`grid gap-6 ${sidebar ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {/* main column */}
        <div className={`${sidebar ? 'lg:col-span-2' : ''} space-y-6`}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <Box w="w-40" h="h-5" className="mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <LabelRow key={i} />)}
              </div>
            </div>
          ))}
        </div>

        {/* sidebar */}
        {sidebar && (
          <div className="space-y-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl shadow-sm p-5 space-y-3">
                <Box w="w-32" h="h-5" className="mb-3" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <Box key={i} w="w-full" h="h-14" rounded="rounded-lg" />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </Pulse>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. DashboardSkeleton
//    Use for the main dashboard – KPI cards, donut placeholder, table rows
// ─────────────────────────────────────────────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <Pulse className="p-6 space-y-8">
      {/* header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Box w="w-64" h="h-7" />
          <Box w="w-48" h="h-4" />
        </div>
        <Box w="w-10" h="h-10" rounded="rounded-lg" />
      </div>

      {/* KPI row 1 – 4 cards */}
      <div>
        <Box w="w-40" h="h-5" className="mb-4" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 space-y-2">
              <Box w="w-3/4" h="h-3" />
              <Box w="w-1/2" h="h-7" />
              <Box w="w-2/3" h="h-3" />
            </div>
          ))}
        </div>
      </div>

      {/* KPI row 2 – 5 cards */}
      <div>
        <Box w="w-44" h="h-5" className="mb-4" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 space-y-2">
              <Box w="w-3/4" h="h-3" />
              <Box w="w-1/2" h="h-7" />
              <Box w="w-2/3" h="h-3" />
            </div>
          ))}
        </div>
      </div>

      {/* Middle row – chart + table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* chart placeholder */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <Box w="w-40" h="h-5" className="mb-4" />
          <div className="flex items-center justify-center h-48">
            <Box w="w-40" h="h-40" rounded="rounded-full" />
          </div>
        </div>
        {/* table placeholder */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
          <Box w="w-48" h="h-5" className="mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Box w="w-8" h="h-8" rounded="rounded-full" className="flex-shrink-0" />
                <Box w="w-full" h="h-4" />
                <Box w="w-20" h="h-4" className="flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Pulse>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. FormSkeleton
//    Use for new / edit form pages
// ─────────────────────────────────────────────────────────────────────────────
export function FormSkeleton({ fields = 8 }: { fields?: number }) {
  return (
    <Pulse className="p-6">
      {/* back + title */}
      <Box w="w-44" h="h-5" className="mb-4" />
      <Box w="w-64" h="h-8" className="mb-6" />

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* optional tab bar */}
        <div className="flex gap-4 border-b border-gray-100 pb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Box key={i} w="w-20" h="h-5" />
          ))}
        </div>

        {/* field grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i}>
              <Box w="w-1/3" h="h-3" className="mb-2" />
              <Box w="w-full" h="h-10" rounded="rounded-lg" />
            </div>
          ))}
        </div>

        {/* footer actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Box w="w-24" h="h-10" rounded="rounded-lg" />
          <Box w="w-32" h="h-10" rounded="rounded-lg" />
        </div>
      </div>
    </Pulse>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. SectionSkeleton  (composable helper – a single white card with n label rows)
// ─────────────────────────────────────────────────────────────────────────────
export function SectionSkeleton({ rows = 6, title = true }: { rows?: number; title?: boolean }) {
  return (
    <Pulse>
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        {title && <Box w="w-40" h="h-5" className="mb-4" />}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: rows }).map((_, i) => <LabelRow key={i} />)}
        </div>
      </div>
    </Pulse>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. TableRowsSkeleton  (simple table with header + rows - for construction/accounting tables)
// ─────────────────────────────────────────────────────────────────────────────
export function TableRowsSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <Pulse>
      <div className="overflow-x-auto rounded-xl shadow-sm">
        <table className="w-full bg-white">
          <thead>
            <tr className="border-b border-gray-100">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-6 py-3 text-left">
                  <Box w="w-20" h="h-3" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50">
                {Array.from({ length: cols }).map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <Box w={j === 0 ? 'w-3/4' : 'w-2/3'} h="h-4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Pulse>
  );
}
