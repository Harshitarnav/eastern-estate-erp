#!/bin/bash

echo "🏗️  Creating Eastern Estate ERP Frontend Structure..."

# Create all directories
mkdir -p src/app/\(auth\)/login
mkdir -p src/app/\(auth\)/register
mkdir -p src/app/\(dashboard\)/properties
mkdir -p src/app/\(dashboard\)/towers
mkdir -p src/app/\(dashboard\)/flats
mkdir -p src/app/\(dashboard\)/customers
mkdir -p src/app/\(dashboard\)/leads
mkdir -p src/app/\(dashboard\)/bookings
mkdir -p src/app/\(dashboard\)/payments
mkdir -p src/app/\(dashboard\)/construction
mkdir -p src/app/\(dashboard\)/store
mkdir -p src/app/\(dashboard\)/hr
mkdir -p src/app/\(dashboard\)/marketing
mkdir -p src/app/\(dashboard\)/reports
mkdir -p src/app/\(dashboard\)/settings

mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/components/forms
mkdir -p src/components/tables
mkdir -p src/components/charts

mkdir -p src/services
mkdir -p src/hooks
mkdir -p src/store
mkdir -p src/types
mkdir -p src/utils

# Create placeholder files for auth pages
cat > src/app/\(auth\)/login/page.tsx << 'EOF'
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1>Login Page - Coming Soon</h1>
    </div>
  );
}
EOF

cat > src/app/\(auth\)/register/page.tsx << 'EOF'
export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1>Register Page - Coming Soon</h1>
    </div>
  );
}
EOF

cat > src/app/\(auth\)/layout.tsx << 'EOF'
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
EOF

# Create dashboard pages
cat > src/app/\(dashboard\)/page.tsx << 'EOF'
export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-600 mt-2">Welcome to Eastern Estate ERP</p>
    </div>
  );
}
EOF

cat > src/app/\(dashboard\)/layout.tsx << 'EOF'
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar and Header will go here */}
      <main>{children}</main>
    </div>
  );
}
EOF

# Create module pages
for module in properties towers flats customers leads bookings payments construction store hr marketing reports settings; do
  cat > src/app/\(dashboard\)/$module/page.tsx << EOF
export default function ${module^}Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">${module^}</h1>
      <p className="text-gray-600 mt-2">Manage your ${module}</p>
    </div>
  );
}
EOF
done

# Create services
cat > src/services/api.ts << 'EOF'
// API service - Will be filled in later
export const apiService = {};
EOF

cat > src/services/auth.service.ts << 'EOF'
// Auth service - Will be filled in later
export const authService = {};
EOF

cat > src/services/properties.service.ts << 'EOF'
// Properties service - Will be filled in later
export const propertiesService = {};
EOF

# Create hooks
cat > src/hooks/useAuth.ts << 'EOF'
// useAuth hook - Will be filled in later
export function useAuth() {}
EOF

cat > src/hooks/useProperties.ts << 'EOF'
// useProperties hook - Will be filled in later
export function useProperties() {}
EOF

# Create store
cat > src/store/authStore.ts << 'EOF'
// Auth store - Will be filled in later
import { create } from 'zustand';

export const useAuthStore = create(() => ({}));
EOF

# Create types
cat > src/types/auth.types.ts << 'EOF'
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}
EOF

cat > src/types/property.types.ts << 'EOF'
export interface Property {
  id: string;
  name: string;
  address: string;
}
EOF

# Create utils
cat > src/utils/formatters.ts << 'EOF'
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-IN');
};
EOF

cat > src/utils/validators.ts << 'EOF'
export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone: string) => {
  return /^[6-9]\d{9}$/.test(phone);
};
EOF

cat > src/utils/constants.ts << 'EOF'
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const FLAT_TYPES = ['1BHK', '2BHK', '3BHK', '4BHK', '5BHK'];

export const FLAT_STATUS = ['Available', 'Blocked', 'Booked', 'Sold'];

export const BOOKING_STATUS = ['Token', 'Booked', 'Agreement Signed', 'Completed'];
EOF

# Create component placeholders
cat > src/components/layout/Sidebar.tsx << 'EOF'
export default function Sidebar() {
  return <aside>Sidebar</aside>;
}
EOF

cat > src/components/layout/Header.tsx << 'EOF'
export default function Header() {
  return <header>Header</header>;
}
EOF

cat > src/components/layout/Breadcrumb.tsx << 'EOF'
export default function Breadcrumb() {
  return <nav>Breadcrumb</nav>;
}
EOF

# Create lib/utils.ts if not exists
mkdir -p src/lib
cat > src/lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF

echo "✅ Structure created successfully!"
echo ""
echo "📁 Created:"
echo "  - 15 dashboard pages"
echo "  - 2 auth pages"
echo "  - Services (api, auth, properties)"
echo "  - Hooks (useAuth, useProperties)"
echo "  - Store (authStore)"
echo "  - Types (auth, property)"
echo "  - Utils (formatters, validators, constants)"
echo "  - Layout components (Sidebar, Header, Breadcrumb)"
echo ""
echo "🚀 Next: npm run dev"
EOF
