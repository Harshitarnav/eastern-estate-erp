# 🏢 Eastern Estate ERP

> Comprehensive Real Estate Management System with Role-Based Access Control and Property-Level Multi-Tenancy

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0+-red.svg)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0+-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd eastern-estate-erp

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Setup database
createdb eastern_estate_erp
cd ../backend
npm run migration:run

# Start development servers
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Access Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api/v1
- **Admin Login:** `admin@eecd.in` / `admin@easternestate`

---

## 📖 Documentation

All comprehensive documentation is available in:
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Complete system overview, features, and usage
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- **Dual Login:** Email/Password and Google OAuth
- **Domain Restriction:** Only `@eecd.in` emails allowed via Google OAuth
- **Role-Based Access:** 8 distinct roles (Super Admin, Admin, HR, Construction, Marketing, Sales, Staff, Customer)
- **JWT Authentication:** Secure token-based sessions

### 🏘️ Property Management
- **Multi-Tenancy:** Property-level access control
- **Inventory Management:** Properties, Towers, Flats
- **Access Control:** Users only see assigned properties
- **Admin Override:** Admins access all properties

### 👥 User Management
- **Automated Provisioning:** Auto-create users when employees are added
- **Multiple Roles:** Users can have multiple roles
- **Property Access:** Granular control over property access
- **Google Integration:** Auto-create users from Google OAuth

### 🏗️ Construction Management
- Construction logs and milestones
- Material inventory tracking
- Progress reporting
- Property-wise sorting for admins

### 💼 Sales & CRM
- Lead management
- Customer relationship tracking
- Booking management
- Payment processing
- Demand drafts

### 👔 HR Management
- Employee management
- User provisioning
- Role assignment
- Access control

### 🔔 Notifications
- Real-time notifications
- Property access changes
- Role updates
- Demand draft approvals

---

## 🎯 Architecture

### Technology Stack

**Backend**
- NestJS (Node.js framework)
- PostgreSQL (Database)
- TypeORM (ORM)
- Passport (Authentication)
- JWT (Token management)

**Frontend**
- Next.js 15 (React framework)
- Tailwind CSS (Styling)
- Zustand (State management)
- Axios (HTTP client)

### Project Structure

```
eastern-estate-erp/
├── backend/
│   ├── src/
│   │   ├── auth/              # Authentication & OAuth
│   │   ├── common/            # Shared guards, decorators, constants
│   │   ├── modules/           # Feature modules
│   │   │   ├── users/         # User & role management
│   │   │   ├── properties/    # Property management
│   │   │   ├── employees/     # HR management
│   │   │   ├── construction/  # Construction management
│   │   │   └── ...
│   │   └── database/          # Migrations & seeds
│   └── .env                   # Environment config
│
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js app router
│   │   ├── components/        # Reusable components
│   │   ├── lib/               # Utilities & helpers
│   │   ├── services/          # API services
│   │   └── store/             # State management
│   └── .env.local             # Environment config
│
└── Documentation files
```

---

## 🔒 Security Features

- ✅ Domain-restricted Google OAuth (`@eecd.in` only)
- ✅ Bcrypt password hashing
- ✅ JWT token authentication
- ✅ Role-based authorization
- ✅ Property-level data isolation
- ✅ API guards on all endpoints
- ✅ Account lockout (5 failed attempts)
- ✅ Refresh token rotation

---

## 👤 Default Users

| Email | Password | Role | Access |
|-------|----------|------|--------|
| `admin@eecd.in` | `admin@easternestate` | Super Admin | Everything |
| `info@eecd.in` | `info@easternestate` | Staff | Assigned properties |
| `arnav@eecd.in` | `arnav@easternestate` | Construction Team | Assigned properties |

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test

# E2E tests
npm run test:e2e
```

---

## 📝 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=eastern_estate_erp

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRATION=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:3000

# Server
PORT=3001
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## 🛠️ Development

### Database Migrations

```bash
# Create new migration
npm run migration:create -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### Code Generation

```bash
# Generate NestJS resource
nest g resource resource-name

# Generate Next.js component
npx create-next-app@latest
```

---

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment instructions.

---

## 📚 API Documentation

API documentation is available at:
- **Development:** http://localhost:3001/api/docs (Swagger)
- **Production:** https://your-domain.com/api/docs

---

## 🤝 Contributing

1. Create feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open Pull Request

---

## 📄 License

Proprietary - Eastern Estate Construction & Development

---

## 📞 Support

For issues or questions:
- Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- Contact: admin@eecd.in

---

**Built with ❤️ by the Eastern Estate Development Team**
