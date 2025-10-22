# 🚀 Eastern Estate ERP - Developer Setup Guide

## Welcome, Developer!

This comprehensive guide will help you set up the Eastern Estate ERP project on your local machine and understand the complete codebase structure.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Project Structure](#project-structure)
4. [Technology Stack](#technology-stack)
5. [Development Workflow](#development-workflow)
6. [API Documentation](#api-documentation)
7. [Database Schema](#database-schema)
8. [Common Tasks](#common-tasks)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## 🎯 Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18+
   ```

2. **npm** or **yarn**
   ```bash
   npm --version  # Should be 9+
   ```

3. **PostgreSQL** (v14 or higher)
   ```bash
   psql --version  # Should be 14+
   ```

4. **Git**
   ```bash
   git --version
   ```

5. **Code Editor** (VS Code recommended)
   - Install recommended extensions:
     - ESLint
     - Prettier
     - PostgreSQL
     - TypeScript

### Knowledge Prerequisites

- TypeScript
- Node.js & Express/NestJS
- React & Next.js
- PostgreSQL
- RESTful APIs
- Git workflows

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/eastern-estate-erp.git
cd eastern-estate-erp
```

### 2. Run the Setup Script

```bash
chmod +x FIRST_TIME_SETUP.sh
./FIRST_TIME_SETUP.sh
```

This script will:
- ✅ Install all dependencies (backend + frontend)
- ✅ Set up PostgreSQL database
- ✅ Run database migrations
- ✅ Create initial admin user
- ✅ Set up environment variables
- ✅ Start development servers

### 3. Access the Application

After setup completes:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api/docs

**Default Admin Credentials:**
- Email: `admin@easternest.com`
- Password: `Admin@123`

---

## 📁 Project Structure

```
eastern-estate-erp/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── common/            # Shared utilities
│   │   ├── config/            # Configuration files
│   │   ├── database/          # Database setup
│   │   └── modules/           # Feature modules
│   │       ├── accounting/    # Accounting & finance
│   │       ├── bookings/      # Property bookings
│   │       ├── construction/  # Construction projects
│   │       ├── customers/     # Customer management
│   │       ├── employees/     # HR & employees
│   │       ├── leads/         # Sales leads (CRM)
│   │       ├── marketing/     # Marketing campaigns
│   │       ├── materials/     # Material inventory
│   │       ├── payments/      # Payment processing
│   │       ├── properties/    # Properties & towers
│   │       ├── purchase-orders/ # Purchase orders
│   │       └── vendors/       # Vendor management
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # Next.js 13+ App Router
│   │   │   ├── (auth)/        # Auth pages
│   │   │   └── (dashboard)/   # Dashboard pages
│   │   ├── components/        # Reusable components
│   │   │   ├── forms/         # Form components
│   │   │   ├── layout/        # Layout components
│   │   │   ├── modals/        # Modal dialogs
│   │   │   └── ui/            # UI components
│   │   ├── services/          # API service layer
│   │   ├── store/             # State management
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utility functions
│   ├── package.json
│   ├── next.config.ts
│   └── tailwind.config.ts
│
├── docs/                       # Documentation
│   └── ACCESS_LEVELS.md
│
├── infrastructure/             # Infrastructure configs
│   └── init-scripts/
│
├── DEVELOPER_SETUP_GUIDE.md    # This file
├── PROJECT_DESCRIPTION.md      # Project overview
├── CODING_STANDARDS.md         # Coding standards
├── FIRST_TIME_SETUP.sh         # Setup script
├── INITIALIZE_DATABASE.sql     # Database schema
└── README.md                   # Project README
```

---

## 🛠️ Technology Stack

### Backend

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **ORM**: TypeORM
- **Authentication**: JWT
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: React Context
- **Forms**: React Hook Form
- **HTTP Client**: Axios

### DevOps & Tools

- **Version Control**: Git
- **Package Manager**: npm
- **Containerization**: Docker (optional)
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest (backend), React Testing Library (frontend)

---

## 💻 Development Workflow

### Backend Development

#### 1. Start Backend Server

```bash
cd backend
npm run start:dev  # With hot-reload
```

The backend will run on `http://localhost:4000`

#### 2. Create a New Module

```bash
cd backend/src/modules
nest g module my-module
nest g controller my-module
nest g service my-module
```

#### 3. Database Migrations

```bash
# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

#### 4. Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e
```

### Frontend Development

#### 1. Start Frontend Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

#### 2. Create a New Page

```bash
# Create a new route
cd frontend/src/app/(dashboard)
mkdir my-page
touch my-page/page.tsx
```

#### 3. Create a New Component

```bash
cd frontend/src/components
mkdir my-component
touch my-component/MyComponent.tsx
```

#### 4. Build for Production

```bash
npm run build
npm run start  # Start production server
```

---

## 📚 API Documentation

### API Endpoints Overview

#### Authentication

```
POST   /api/auth/login          # Login
POST   /api/auth/register       # Register
POST   /api/auth/refresh        # Refresh token
POST   /api/auth/logout         # Logout
```

#### Leads (CRM)

```
GET    /api/leads               # Get all leads
POST   /api/leads               # Create lead
GET    /api/leads/:id           # Get lead by ID
PUT    /api/leads/:id           # Update lead
DELETE /api/leads/:id           # Delete lead
POST   /api/leads/:id/followup  # Add follow-up
```

#### Customers

```
GET    /api/customers           # Get all customers
POST   /api/customers           # Create customer
GET    /api/customers/:id       # Get customer
PUT    /api/customers/:id       # Update customer
DELETE /api/customers/:id       # Delete customer
```

#### Bookings

```
GET    /api/bookings            # Get all bookings
POST   /api/bookings            # Create booking
GET    /api/bookings/:id        # Get booking
PUT    /api/bookings/:id        # Update booking
DELETE /api/bookings/:id        # Delete booking
```

#### Payments

```
GET    /api/payments            # Get all payments
POST   /api/payments            # Create payment
GET    /api/payments/:id        # Get payment
PUT    /api/payments/:id        # Update payment
DELETE /api/payments/:id        # Delete payment
```

#### Construction

```
GET    /api/construction/projects          # Get projects
POST   /api/construction/projects          # Create project
GET    /api/construction/projects/:id      # Get project
PUT    /api/construction/projects/:id      # Update project
DELETE /api/construction/projects/:id      # Delete project
```

#### Accounting

```
GET    /api/accounting/accounts            # Get accounts
POST   /api/accounting/accounts            # Create account
GET    /api/accounting/expenses            # Get expenses
POST   /api/accounting/expenses            # Create expense
GET    /api/accounting/budgets             # Get budgets
POST   /api/accounting/budgets             # Create budget
```

### Testing APIs

Use the Swagger documentation at `http://localhost:4000/api/docs` or use tools like:
- Postman
- Thunder Client (VS Code extension)
- cURL

Example with cURL:

```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@easternest.com","password":"Admin@123"}'

# Get leads (with token)
curl http://localhost:4000/api/leads \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🗄️ Database Schema

### Core Tables

#### users
- User authentication and profile information
- Columns: id, email, password, name, role, status, created_at

#### leads
- Sales leads and inquiries
- Columns: id, name, email, phone, source, status, assigned_to, created_at

#### customers
- Converted leads/actual customers
- Columns: id, name, email, phone, address, status, created_at

#### properties
- Real estate properties
- Columns: id, name, location, type, total_units, status

#### towers
- Towers within properties
- Columns: id, property_id, name, floors, status

#### flats
- Individual units/flats
- Columns: id, tower_id, flat_number, bhk_type, area, price, status

#### bookings
- Property bookings
- Columns: id, customer_id, flat_id, total_amount, booking_amount, status

#### payments
- Payment transactions
- Columns: id, booking_id, amount, payment_method, transaction_id, status

#### construction_projects
- Construction projects
- Columns: id, name, location, start_date, end_date, budget, status

#### employees
- Employee records
- Columns: id, name, email, phone, designation, salary, joining_date

#### accounting_accounts
- Chart of accounts
- Columns: id, code, name, type, balance

#### expenses
- Expense records
- Columns: id, category, amount, date, description, status

### Database Relationships

```
properties (1) -> (many) towers
towers (1) -> (many) flats
customers (1) -> (many) bookings
flats (1) -> (many) bookings
bookings (1) -> (many) payments
users (1) -> (many) leads (assigned_to)
```

---

## 🔧 Common Tasks

### Adding a New Feature Module

1. **Backend: Create Module**
   ```bash
   cd backend/src/modules
   nest g resource my-feature
   ```

2. **Create Entity**
   ```typescript
   // my-feature/entities/my-feature.entity.ts
   @Entity('my_features')
   export class MyFeature {
     @PrimaryGeneratedColumn()
     id: number;
     
     @Column()
     name: string;
     
     @CreateDateColumn()
     created_at: Date;
   }
   ```

3. **Create DTOs**
   ```typescript
   // my-feature/dto/create-my-feature.dto.ts
   export class CreateMyFeatureDto {
     @IsString()
     @IsNotEmpty()
     name: string;
   }
   ```

4. **Frontend: Create Service**
   ```typescript
   // frontend/src/services/my-feature.service.ts
   export const myFeatureService = {
     getAll: () => api.get('/my-features'),
     create: (data) => api.post('/my-features', data),
   };
   ```

5. **Create Page**
   ```typescript
   // frontend/src/app/(dashboard)/my-features/page.tsx
   export default function MyFeaturesPage() {
     // Implementation
   }
   ```

### Updating Database Schema

1. Modify entity file
2. Generate migration:
   ```bash
   npm run migration:generate -- -n AddColumnToTable
   ```
3. Review generated migration
4. Run migration:
   ```bash
   npm run migration:run
   ```

### Adding Authentication to Route

Backend:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
@Get()
findAll() {
  return this.service.findAll();
}
```

Frontend:
```typescript
// Middleware already handles auth
// Just make authenticated requests
const data = await api.get('/protected-route');
```

---

## 🐛 Troubleshooting

### Backend Issues

**Issue**: `Cannot connect to database`
```bash
# Solution: Check PostgreSQL is running
sudo systemctl status postgresql

# Start if not running
sudo systemctl start postgresql

# Check connection in .env file
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=eastern_estate_erp
```

**Issue**: `Port 4000 already in use`
```bash
# Find process using port
lsof -i :4000

# Kill process
kill -9 <PID>
```

**Issue**: `Module not found`
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

**Issue**: `Error: Cannot find module 'next'`
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json .next
npm install
```

**Issue**: `Hydration error`
- Check for server/client rendering mismatch
- Ensure consistent data between server and client
- Use `suppressHydrationWarning` if intentional

**Issue**: `API calls failing with CORS error`
```bash
# Backend: Check CORS configuration in main.ts
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

### Database Issues

**Issue**: `Migration fails`
```bash
# Revert last migration
npm run migration:revert

# Fix the migration file
# Run again
npm run migration:run
```

**Issue**: `Duplicate column error`
```bash
# Check database current state
psql -U postgres -d eastern_estate_erp
\d table_name

# Drop column if needed
ALTER TABLE table_name DROP COLUMN column_name;
```

---

## ✅ Best Practices

### Code Style

1. **Follow TypeScript strict mode**
   ```typescript
   // Good
   function greet(name: string): string {
     return `Hello, ${name}`;
   }
   
   // Bad
   function greet(name) {
     return `Hello, ${name}`;
   }
   ```

2. **Use meaningful variable names**
   ```typescript
   // Good
   const totalRevenue = calculateRevenue();
   
   // Bad
   const tr = calc();
   ```

3. **Keep functions small and focused**
   ```typescript
   // Good
   function validateEmail(email: string): boolean {
     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
   }
   
   function validateUser(user: User): boolean {
     return validateEmail(user.email) && user.age >= 18;
   }
   ```

### Git Workflow

1. **Branch naming**
   - feature/add-payment-module
   - fix/login-bug
   - refactor/improve-performance

2. **Commit messages**
   ```
   feat: add payment processing module
   fix: resolve login authentication issue
   refactor: improve database query performance
   docs: update API documentation
   ```

3. **Before committing**
   ```bash
   # Run linter
   npm run lint
   
   # Run tests
   npm run test
   
   # Format code
   npm run format
   ```

### Security

1. **Never commit sensitive data**
   - Keep `.env` in `.gitignore`
   - Use environment variables
   - Don't hardcode passwords/keys

2. **Validate all inputs**
   ```typescript
   @Post()
   create(@Body() dto: CreateUserDto) {
     // DTOs automatically validate
     return this.service.create(dto);
   }
   ```

3. **Use parameterized queries**
   ```typescript
   // Good (TypeORM handles this)
   await this.repository.findOne({ where: { id } });
   
   // Bad (SQL injection risk)
   await this.repository.query(`SELECT * FROM users WHERE id = ${id}`);
   ```

### Performance

1. **Use pagination**
   ```typescript
   @Get()
   findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
     return this.service.findAll(page, limit);
   }
   ```

2. **Add database indexes**
   ```typescript
   @Entity()
   @Index(['email'])
   export class User {
     @Column({ unique: true })
     email: string;
   }
   ```

3. **Cache frequent queries**
   ```typescript
   @Cacheable('users', 300) // 5 minutes
   async findAll() {
     return this.repository.find();
   }
   ```

---

## 📞 Getting Help

### Resources

- **Project Documentation**: See `/docs` folder
- **User Guide**: `EASTERN_ESTATE_ERP_COMPLETE_USER_GUIDE.md`
- **Coding Standards**: `CODING_STANDARDS.md`
- **API Docs**: http://localhost:4000/api/docs

### Team Contacts

- **Technical Lead**: tech-lead@easternest.com
- **DevOps**: devops@easternest.com
- **IT Support**: support@easternest.com

### Issue Reporting

1. Check existing issues on GitHub
2. Create detailed bug report with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Screenshots/logs

---

## 🎉 You're Ready!

You now have everything needed to start developing on Eastern Estate ERP. Happy coding! 🚀

**Next Steps:**
1. ✅ Run `./FIRST_TIME_SETUP.sh`
2. ✅ Explore the codebase
3. ✅ Try creating a simple feature
4. ✅ Read `CODING_STANDARDS.md`
5. ✅ Join the team standup

Welcome to the team! 👨‍💻👩‍💻
