# Eastern Estate ERP System

**Building Homes, Nurturing Bonds**

A comprehensive Enterprise Resource Planning (ERP) system specifically designed for real estate companies. This system manages everything from property listings and customer relationships to financial transactions, construction projects, employee management, and marketing campaigns.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Features & Modules](#features--modules)
5. [Getting Started](#getting-started)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [Access Levels & Permissions](#access-levels--permissions)
9. [Development Guide](#development-guide)
10. [Deployment](#deployment)
11. [Team Structure](#team-structure)

---

## 🎯 Project Overview

### Vision
Eastern Estate ERP is a full-stack enterprise solution that streamlines all aspects of real estate business operations - from lead generation and property management to financial tracking and employee administration.

### Key Statistics
- **16 Complete Modules** (Including Notifications & Chat)
- **230+ Files**
- **45,000+ Lines of Code**
- **150+ API Endpoints**
- **19 Database Tables**
- **700+ Database Fields**
- **11 Role-Based Access Levels**
- **Real-time Team Communication**
- **Smart Notification System**

---

## 🛠️ Technology Stack

### Backend
- **Framework:** NestJS 10.x (TypeScript)
- **Database:** PostgreSQL 16+
- **ORM:** TypeORM with migrations
- **Authentication:** JWT (JSON Web Tokens) + Google OAuth 2.0 SSO
- **Validation:** class-validator, class-transformer
- **API Style:** RESTful
- **File Upload:** Multer
- **Security:** bcrypt for password hashing, domain-restricted SSO

### Frontend
- **Framework:** Next.js 14.x (TypeScript)
- **Styling:** Tailwind CSS
- **UI Components:** Custom component library
- **State Management:** React Hooks
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod validation

### DevOps & Tools
- **Version Control:** Git
- **Package Manager:** npm
- **API Testing:** Postman/Thunder Client
- **Code Quality:** ESLint, Prettier
- **Database Migrations:** TypeORM CLI

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   Pages    │  │ Components │  │  Services  │        │
│  └────────────┘  └────────────┘  └────────────┘        │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/REST API
┌───────────────────────▼─────────────────────────────────┐
│                  Backend (NestJS)                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │ Controllers│  │  Services  │  │  Entities  │        │
│  └────────────┘  └────────────┘  └────────────┘        │
└───────────────────────┬─────────────────────────────────┘
                        │ TypeORM
┌───────────────────────▼─────────────────────────────────┐
│              Database (PostgreSQL)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Properties│ │Customers │ │ Bookings │ │ Payments │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Project Structure

```
eastern-estate-erp/
├── backend/                    # NestJS Backend API
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── common/            # Shared utilities
│   │   ├── modules/           # Business modules
│   │   │   ├── properties/    # Property management
│   │   │   ├── leads/         # Lead tracking
│   │   │   ├── customers/     # Customer management
│   │   │   ├── bookings/      # Booking contracts
│   │   │   ├── payments/      # Payment tracking
│   │   │   ├── inventory/     # Inventory control
│   │   │   ├── construction/  # Construction projects
│   │   │   ├── purchase-orders/ # Procurement
│   │   │   ├── employees/     # HR management
│   │   │   └── marketing/     # Campaign tracking
│   │   ├── main.ts           # Application entry
│   │   └── app.module.ts     # Root module
│   ├── .env                   # Environment variables
│   └── package.json
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # App directory (Next.js 14)
│   │   │   └── (dashboard)/   # Dashboard pages
│   │   ├── components/        # React components
│   │   │   ├── forms/         # Form components
│   │   │   ├── tables/        # Data tables
│   │   │   └── ui/            # UI components
│   │   ├── services/          # API service layer
│   │   └── types/             # TypeScript types
│   ├── public/                # Static assets
│   └── package.json
│
├── database-schema.sql         # Database schema
└── README.md                   # This file
```

---

## ✨ Features & Modules

### 1. 🏢 Property Management
**Purpose:** Manage real estate properties, towers, and units

**Key Features:**
- Multi-project portfolio management
- Tower/building tracking with floor plans
- Flat/unit inventory with 40+ attributes
- RERA compliance tracking
- Amenities management
- Image & document uploads
- Area calculations (carpet, built-up, super built-up)
- Pricing management per unit
- Availability status tracking

**Database Tables:** `properties`, `towers`, `floors`, `flats`

### 2. 📊 Lead Management (CRM)
**Purpose:** Track and nurture potential customers

**Key Features:**
- Lead capture from multiple sources
- Lead scoring & qualification system
- UTM parameter tracking for campaigns
- Assignment to sales executives
- Follow-up scheduling & reminders
- Lead status workflow (New → Qualified → Converted)
- Lost lead reason tracking
- Source attribution & analytics
- Integration with marketing campaigns

**Database Table:** `leads`

### 3. 👥 Customer Management
**Purpose:** Maintain customer database and relationships

**Key Features:**
- Comprehensive customer profiles (50+ fields)
- KYC document management (PAN, Aadhar, Passport)
- Customer portal access
- Relationship tracking (referred by, broker info)
- Communication history
- Purchase history
- Customer segmentation
- Document storage

**Database Table:** `customers`

### 4. 📝 Booking Management
**Purpose:** Handle property bookings and agreements

**Key Features:**
- Booking contracts with 60+ fields
- Multiple payment plan support
- Token amount tracking
- Agreement document management
- Broker commission calculations
- Discount & pricing adjustments
- Booking status workflow
- GST & registration charge tracking
- Cancellation handling with refunds
- Sales person assignment

**Database Table:** `bookings`

### 5. 💰 Payment Tracking
**Purpose:** Manage all financial transactions

**Key Features:**
- Payment recording with receipts
- Multiple payment modes (Cash, Cheque, UPI, Card, Bank Transfer)
- Payment verification workflow (3-step)
- Payment schedule management
- TDS calculations
- Late payment penalties
- GST tracking
- Payment status tracking
- Bounce & refund handling
- Invoice generation

**Database Tables:** `payments`, `payment_schedules`

### 6. 📦 Inventory Management
**Purpose:** Track construction materials and supplies

**Key Features:**
- Item catalog with 50+ fields
- Stock level monitoring
- Low stock alerts
- Reorder level management
- Supplier information
- Cost tracking
- Warehouse location tracking
- Item categories
- Unit of measurement support
- Stock valuation

**Database Table:** `inventory_items`

### 7. 🏗️ Construction Management
**Purpose:** Monitor project progress and quality

**Key Features:**
- Project lifecycle tracking (13 phases)
- Milestone management
- Budget vs actual tracking
- Contractor management
- Quality inspection system
- Progress percentage calculation
- Delay tracking
- Document management
- Safety compliance
- Material usage tracking

**Database Table:** `construction_projects`

### 8. 🛒 Purchase Orders (Procurement)
**Purpose:** Manage procurement workflow

**Key Features:**
- Multi-item purchase orders
- Approval workflow (3-tier)
- Supplier management
- Budget allocation
- Payment terms tracking
- Delivery tracking
- Invoice matching
- Receiving workflow
- Cost analysis
- Order status tracking

**Database Table:** `purchase_orders`

### 9. 👔 Employee Management (HR)
**Purpose:** Manage workforce and HR operations

**Key Features:**
- Employee profiles (60+ fields)
- 10 department categories
- Leave management (3 types: Sick, Casual, Earned)
- Salary structure (Basic + HRA + Allowances)
- Attendance tracking
- Performance reviews
- Document management (Aadhar, PAN, etc.)
- Bank details for salary transfer
- Emergency contact information
- Employment history

**Database Table:** `employees`

### 10. 📢 Marketing Campaigns
**Purpose:** Track marketing ROI and campaign performance

**Key Features:**
- Campaign management (70+ fields)
- Multi-channel support (18+ channels)
- Budget tracking & utilization
- ROI calculations
- Performance metrics (Impressions, Clicks, CTR)
- Lead generation tracking
- Conversion tracking
- Cost per lead/conversion
- UTM parameter management
- Agency/vendor management
- Channel performance analytics

**Database Table:** `marketing_campaigns`

### 11. 📈 Reports & Analytics
**Purpose:** Business intelligence and reporting

**Report Types:**
1. **Sales Report:** Leads, conversions, pipeline analysis
2. **Financial Report:** Revenue, collections, pending payments
3. **Inventory Report:** Stock levels, valuation, alerts
4. **Property Report:** Occupancy, availability, revenue
5. **Employee Report:** Attendance, leave, payroll
6. **Construction Report:** Progress, budget, timeline

**Features:**
- Date range filtering
- Export to PDF/Excel
- Quick stats dashboard
- Visual charts & graphs
- Trend analysis

### 12. 🔐 Authentication & Authorization
**Purpose:** Secure access control

**Features:**
- JWT-based authentication
- 11 role-based access levels
- Granular permissions system
- Password encryption (bcrypt)
- Token refresh mechanism
- Login attempt tracking
- Account lockout on failures
- Email verification
- Session management

**Database Tables:** `users`, `roles`, `permissions`, `refresh_tokens`

### 13. 📤 File Management
**Purpose:** Handle document uploads

**Features:**
- Image uploads (properties, flats)
- Document uploads (agreements, receipts)
- File type validation
- Size limits
- Secure storage
- File preview support

### 14. 🔔 Notifications System
**Purpose:** Real-time team notifications and alerts

**Key Features:**
- Role-based notifications (e.g., notify all "Sales Managers")
- Department-based notifications (e.g., notify "SALES" department)
- Individual user notifications
- 5 notification types: INFO, SUCCESS, WARNING, ERROR, ALERT
- 10 categories: BOOKING, PAYMENT, LEAD, CONSTRUCTION, EMPLOYEE, CUSTOMER, ACCOUNTING, SYSTEM, TASK, REMINDER
- Notification bell in top bar with unread count badge
- Dropdown showing 5 most recent notifications
- Full notifications page with filtering
- Mark as read/unread functionality
- Bulk operations (mark all as read, clear read)
- Action links in notifications (navigate to relevant page)
- Priority system (1-10)
- Email integration ready (SMTP configuration needed)
- Auto-refresh every 30 seconds

**Database Table:** `notifications`

**API Endpoints:** 7 endpoints (create, get all, get unread count, mark as read, mark all as read, delete, clear read)

### 15. 💬 Chat System
**Purpose:** Internal team communication and collaboration

**Key Features:**
- **Direct Messaging:** One-on-one conversations with any employee
- **Group Chats:** Multi-person conversations with custom groups
- **Employee Search:** Find anyone in the company to start a chat
- **Message History:** Full conversation tracking and persistence
- **Real-time Updates:** Messages refresh every 10 seconds
- **Unread Counts:** Badge showing unread message count
- **Modern UI:** Beautiful slide-in panel with smooth animations
- **Message Features:**
  - Send text messages
  - @Mention support (backend ready)
  - Reply to messages (backend ready)
  - Edit/delete messages (backend ready)
  - File attachments (backend ready)
- **Group Management:**
  - Create groups with multiple members
  - Add/remove participants
  - Admin/member roles
  - Group descriptions
- **Chat UI:**
  - Chat button in top bar next to notifications
  - Search conversations
  - Visual message distinction (own vs others)
  - Message timestamps
  - Keyboard shortcuts (Enter to send, Shift+Enter for new line)
  - Auto-scroll to latest message

**Database Tables:** `chat_groups`, `chat_participants`, `chat_messages`, `chat_attachments`

**API Endpoints:** 16 endpoints covering all chat operations

### 16. 🔧 System Features
**Purpose:** Core platform capabilities

**Features:**
- Search & filtering across all modules
- Pagination support
- Sorting capabilities
- Audit trails (created_by, updated_by)
- Soft deletes
- Timestamps on all records
- Data validation
- Error handling
- Loading states
- Empty states
- Real-time notifications
- Team chat & collaboration

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js:** v18.x or higher
- **npm:** v9.x or higher
- **PostgreSQL:** v16.x or higher
- **Git:** Latest version

### Installation Steps

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd eastern-estate-erp
```

#### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

**Required Environment Variables:**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=eastern_estate_erp
DB_SYNCHRONIZE=false  # Set to false in production
DB_LOGGING=true

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Google OAuth (Optional - for SSO)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:3000

# File Upload
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=5242880  # 5MB

# Server
PORT=3001
```

> **📘 Google OAuth Setup:** See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for detailed instructions on configuring Google SSO with @eecd.in domain restriction.

#### 3. Database Setup

```bash
# Create database
createdb eastern_estate_erp

# Run the schema
psql -U postgres -d eastern_estate_erp -f ../database-schema.sql

# Seed initial users (including info@eecd.in and hr@eecd.in)
npm run seed:users

# Verify tables created
psql -U postgres -d eastern_estate_erp -c "\dt"
```

#### 4. Start Backend Server

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Backend will run on: `http://localhost:3001`

#### 5. Frontend Setup

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

**Frontend Environment Variables:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### 6. Start Frontend Server

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm run start
```

Frontend will run on: `http://localhost:3000`

### 7. Login & Access

The system now supports two authentication methods:

#### Option 1: Google OAuth SSO (Recommended for @eecd.in users)
1. Navigate to `http://localhost:3000/login`
2. Click "Sign in with Google (@eecd.in)"
3. Select your @eecd.in Google Workspace account
4. You'll be redirected to the dashboard

**Pre-configured accounts:**
- `info@eecd.in` - Super Admin
- `hr@eecd.in` - Admin

#### Option 2: Traditional Email/Password
Use the seeded accounts created by `npm run seed:users`:

**Test Login Credentials:**
| Email | Password | Role |
|-------|----------|------|
| superadmin@easternestates.com | Password@123 | Super Admin |
| admin@easternestates.com | Password@123 | Admin |
| accountant@easternestates.com | Password@123 | Accountant |
| salesmanager@easternestates.com | Password@123 | Sales Manager |

> **🔐 Security Note:** Change default passwords in production. See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for SSO configuration.
WHERE u.email = 'admin@eastern-estate.com'
AND r.name = 'super_admin';
```

### 8. Login

Navigate to `http://localhost:3000` and login with:
- **Email:** admin@eastern-estate.com
- **Password:** Admin@123

---

## 💾 Database Schema

### Core Tables

#### users
- Authentication and user profiles
- Links to roles via `user_roles`

#### roles & permissions
- 11 pre-defined roles
- Granular permission system
- Many-to-many relationships

#### properties
- Master property records
- Links to towers and flats

#### towers
- Building/tower information within properties
- Links to floors and flats

#### flats
- Individual unit details (40+ fields)
- Pricing, dimensions, amenities

#### leads
- Prospect tracking (70+ fields)
- Source attribution, UTM tracking

#### customers
- Customer master data (50+ fields)
- KYC documents

#### bookings
- Property booking contracts (60+ fields)
- Payment plans, agreements

#### payments
- Transaction records (50+ fields)
- Multi-mode support, verification workflow

#### payment_schedules
- Installment plans
- Due dates and tracking

#### inventory_items
- Material catalog (50+ fields)
- Stock management

#### construction_projects
- Project lifecycle tracking (60+ fields)
- 13 progress phases

#### purchase_orders
- Procurement workflow (50+ fields)
- Multi-item support

#### employees
- HR records (60+ fields)
- Leave, salary, documents

#### marketing_campaigns
- Campaign tracking (70+ fields)
- Multi-channel analytics

### Relationships

```
properties (1) ←→ (M) towers ←→ (M) flats
customers (1) ←→ (M) bookings ←→ (1) flats
bookings (1) ←→ (M) payments
bookings (1) ←→ (M) payment_schedules
users (M) ←→ (M) roles ←→ (M) permissions
```

### Total Fields
- **600+ database columns** across all tables
- Comprehensive data modeling
- Audit trails on all records

---

## 🔌 API Documentation

### Base URL
```
http://localhost:3001
```

### Authentication

All protected routes require JWT token:
```
Authorization: Bearer <jwt_token>
```

### Endpoints Summary

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `GET /auth/profile` - Get current user

#### Properties
- `GET /properties` - List all properties
- `GET /properties/:id` - Get property details
- `POST /properties` - Create property
- `PATCH /properties/:id` - Update property
- `DELETE /properties/:id` - Delete property

#### Leads
- `GET /leads` - List leads (with filters)
- `GET /leads/statistics` - Get lead stats
- `GET /leads/:id` - Get lead details
- `POST /leads` - Create lead
- `PATCH /leads/:id` - Update lead
- `PATCH /leads/:id/convert` - Convert to customer
- `DELETE /leads/:id` - Delete lead

#### Customers
- `GET /customers` - List customers
- `GET /customers/statistics` - Get customer stats
- `GET /customers/:id` - Get customer details
- `POST /customers` - Create customer
- `PATCH /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

#### Bookings
- `GET /bookings` - List bookings
- `GET /bookings/statistics` - Get booking stats
- `GET /bookings/:id` - Get booking details
- `POST /bookings` - Create booking
- `PATCH /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking

#### Payments
- `GET /payments` - List payments
- `GET /payments/statistics` - Get payment stats
- `GET /payments/:id` - Get payment details
- `POST /payments` - Record payment
- `PATCH /payments/:id` - Update payment
- `PATCH /payments/:id/verify` - Verify payment
- `DELETE /payments/:id` - Delete payment

#### Marketing
- `GET /marketing/campaigns` - List campaigns
- `GET /marketing/campaigns/statistics` - Get campaign stats
- `GET /marketing/campaigns/:id` - Get campaign details
- `POST /marketing/campaigns` - Create campaign
- `PATCH /marketing/campaigns/:id` - Update campaign
- `PATCH /marketing/campaigns/:id/metrics` - Update metrics
- `DELETE /marketing/campaigns/:id` - Delete campaign

*Similar patterns for all other modules...*

### Query Parameters

Most list endpoints support:
- `?search=<term>` - Search across relevant fields
- `?page=<number>` - Page number (default: 1)
- `?limit=<number>` - Items per page (default: 10)
- `?sortBy=<field>` - Sort field
- `?sortOrder=<asc|desc>` - Sort direction

### Response Format

**Success Response:**
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

---

## 🔐 Access Levels & Permissions

### 11 Role-Based Access Levels

#### 1. Super Administrator 🔴
**Full system access**
- All CRUD operations
- System configuration
- User management
- Cannot be deleted (system role)

#### 2. Administrator 🔴
**Business admin access**
- Most modules (except system config)
- User management (limited)
- Financial operations
- Reports & analytics

#### 3. Accountant 💰
**Financial operations**
- View/manage payments
- View bookings (read-only)
- Financial reports
- Invoice management

#### 4. Sales Manager 📈
**Sales team leadership**
- Full sales operations
- Lead assignment
- Booking approvals
- Team performance tracking
- Sales reports

#### 5. Sales Executive 📊
**Individual contributor**
- Assigned leads only
- Create bookings (requires approval)
- Customer management (limited)
- Follow-up activities

#### 6. Marketing Manager 📣
**Marketing operations**
- Campaign management
- Lead source tracking
- Marketing analytics
- ROI reporting

#### 7. Construction Manager 🏗️
**Project management**
- Construction projects
- Milestone tracking
- Contractor management
- Progress reports

#### 8. Store Keeper 📦
**Inventory control**
- Inventory management
- Purchase orders
- Stock tracking
- Receiving goods

#### 9. HR Manager 👥
**HR operations**
- Employee management
- Leave approvals
- Payroll processing
- HR reports

#### 10. Customer 👤
**Customer portal (limited)**
- View own bookings
- Payment history
- Download receipts
- Update profile

#### 11. Broker 🤝
**Channel partner (limited)**
- View assigned leads
- Create bookings (commission-based)
- Track commissions
- View properties

### Permission Matrix

| Module | Super Admin | Admin | Accountant | Sales Mgr | Sales Exec | Marketing | Construction | Store | HR | Customer | Broker |
|--------|:-----------:|:-----:|:----------:|:---------:|:----------:|:---------:|:------------:|:-----:|:--:|:--------:|:------:|
| **Properties** | ✅ | ✅ | 👁️ | ✅ | 👁️ | ✅ | 👁️ | ❌ | ❌ | 👁️ | 👁️ |
| **Leads** | ✅ | ✅ | 👁️ | ✅ | ✅* | ✅ | ❌ | ❌ | ❌ | ❌ | ✅* |
| **Customers** | ✅ | ✅ | 👁️ | ✅ | ✅* | 👁️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Bookings** | ✅ | ✅ | 👁️ | ✅ | ✅** | 👁️ | ❌ | ❌ | ❌ | 👁️* | ✅** |
| **Payments** | ✅ | ✅ | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | ❌ | 👁️* | 👁️* |
| **Inventory** | ✅ | ✅ | 👁️ | ❌ | ❌ | ❌ | 👁️ | ✅ | ❌ | ❌ | ❌ |
| **Construction** | ✅ | ✅ | 👁️ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Purchase Orders** | ✅ | ✅ | ✅*** | ❌ | ❌ | ❌ | 👁️ | ✅ | ❌ | ❌ | ❌ |
| **Employees** | ✅ | ✅ | 👁️ | 👁️ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Marketing** | ✅ | ✅ | 👁️ | 👁️ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Reports** | ✅ | ✅ | ✅**** | ✅**** | ✅***** | ✅**** | ✅**** | ✅**** | ✅**** | 👁️* | 👁️* |
| **Users** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅* | ❌ | ❌ |

**Legend:**
- ✅ = Full access (Create, Read, Update, Delete)
- 👁️ = View only (Read)
- ❌ = No access
- \* = Restricted to own records
- \*\* = Create only (requires approval)
- \*\*\* = Approve access
- \*\*\*\* = Department-specific reports
- \*\*\*\*\* = Own performance only

---

## 👨‍💻 Development Guide

### Code Standards

#### TypeScript
- Use strict mode
- Define interfaces for all data structures
- Use enums for fixed values
- Avoid `any` type

#### Naming Conventions
- **Files:** kebab-case (`user.service.ts`)
- **Classes:** PascalCase (`UserService`)
- **Functions:** camelCase (`getUserById`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Interfaces:** PascalCase with `I` prefix (`IUser`)

#### Backend Structure

```typescript
// Entity example
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  email: string;
  
  // ... more fields
}

// Service example
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}

// Controller example
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
```

#### Frontend Structure

```typescript
// Service example
export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  }
};

// Component example
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    const data = await userService.getUsers();
    setUsers(data);
  };
  
  return (
    // JSX
  );
}
```

### Adding a New Module

#### 1. Backend

```bash
# Generate module
nest g module modules/new-module
nest g service modules/new-module
nest g controller modules/new-module
```

Create files:
- `entities/new-entity.entity.ts`
- `dto/create-new-entity.dto.ts`
- `dto/update-new-entity.dto.ts`
- `dto/query-new-entity.dto.ts`
- `dto/new-entity-response.dto.ts`
- `dto/index.ts`

Register in `app.module.ts`

#### 2. Frontend

Create files:
- `services/new-service.service.ts`
- `app/(dashboard)/new-module/page

2. Import the NotificationsService in any backend service to send notifications:

```typescript
await this.notificationsService.create({
  targetRoles: 'Admin,Manager',
  title: 'New Booking',
  message: 'A new booking has been created',
  type: 'SUCCESS',
  category: 'BOOKING',
  actionUrl: '/bookings/123',
  shouldSendEmail: true
});
```
Email notifications will be automatically sent once we configure our SMTP settings in the .env file!
