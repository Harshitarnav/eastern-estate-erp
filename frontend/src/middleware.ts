import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // No redirects needed - dashboard is at root with route grouping
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
