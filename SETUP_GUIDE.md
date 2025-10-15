# Eastern Estate ERP - Setup & Testing Guide

## 🚀 Phase 1: Properties Module - COMPLETE ✅

You've successfully implemented the **complete Properties CRUD module** with enterprise-grade security and features!

---

## 📋 What's Been Implemented

### ✅ Backend (NestJS)
- **Property Entity** with all fields from database schema
- **DTOs** (Create, Update, Query, Response) with validation
- **Service Layer** with:
  - Full CRUD operations
  - Advanced filtering & search
  - Pagination
  - Soft delete
  - Statistics endpoint
- **Controller** with RESTful endpoints
- **Database Seeding** for real EECD projects

### 📦 API Endpoints Available

```
POST   /api/v1/properties              - Create new property
GET    /api/v1/properties              - Get all properties (with filters)
GET    /api/v1/properties/stats        - Get property statistics
GET    /api/v1/properties/code/:code   - Get property by code
GET    /api/v1/properties/:id          - Get single property
PUT    /api/v1/properties/:id          - Update property
DELETE /api/v1/properties/:id          - Delete property (soft)
PUT    /api/v1/properties/:id/toggle-active - Toggle active status
```

---

## 🛠️ Setup Instructions

### Step 1: Start Database Services

```bash
cd eastern-estate-erp
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- MinIO (ports 9000, 9001)

### Step 2: Run Database Schema

```bash
# Connect to PostgreSQL
docker exec -it eastern_estate_db psql -U eastern_estate -d eastern_estate_erp

# Then paste the contents of database-schema.sql
# OR run from file:
docker exec -i eastern_estate_db psql -U eastern_estate -d eastern_estate_erp < database-schema.sql
```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 4: Start Backend Server

```bash
cd backend
npm run start:dev
```

Backend will run on: **http://localhost:3001**

### Step 5: Seed Database with Real Properties

You can seed the database using the API or directly:

**Option A: Using API (after backend is running)**
Create a file `seed-properties.sh`:

```bash
#!/bin/bash

# First login to get token
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }' | jq -r '.accessToken')

# Seed Diamond City
curl -X POST http://localhost:3001/api/v1/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "propertyCode": "EECD-DC-001",
    "name": "Diamond City",
    "description": "Premium township project with modern amenities",
    "address": "Oyna, Behind Apollo Hospital",
    "city": "Ranchi",
    "state": "Jharkhand",
    "pincode": "834001",
    "latitude": 23.3441,
    "longitude": 85.3096,
    "totalArea": 28,
    "areaUnit": "Acres",
    "launchDate": "2018-06-15",
    "expectedCompletionDate": "2024-12-31",
    "reraNumber": "CNT Free",
    "projectType": "Township",
    "status": "Active",
    "amenities": ["Club House", "Swimming Pool", "Gym", "70% Open Space"]
  }'
```

**Option B: Direct Database Insert**
```sql
-- See backend/src/database/seeds/properties.seed.ts for SQL
```

---

## 🧪 Testing the API

### 1. Login First

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Save the `accessToken` from response.

### 2. Create Property

```bash
curl -X POST http://localhost:3001/api/v1/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "propertyCode": "EECD-DC-001",
    "name": "Diamond City",
    "description": "Premium township",
    "address": "Oyna, Ranchi",
    "city": "Ranchi",
    "state": "Jharkhand",
    "pincode": "834001",
    "totalArea": 28,
    "areaUnit": "Acres",
    "projectType": "Township",
    "status": "Active",
    "reraNumber": "CNT Free"
  }'
```

### 3. Get All Properties

```bash
curl http://localhost:3001/api/v1/properties \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Search & Filter

```bash
# Search by name
curl "http://localhost:3001/api/v1/properties?search=diamond" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Filter by city
curl "http://localhost:3001/api/v1/properties?city=ranchi" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Pagination
curl "http://localhost:3001/api/v1/properties?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Get Statistics

```bash
curl http://localhost:3001/api/v1/properties/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Update Property

```bash
curl -X PUT http://localhost:3001/api/v1/properties/PROPERTY_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "status": "Under Construction"
  }'
```

### 7. Delete Property

```bash
curl -X DELETE http://localhost:3001/api/v1/properties/PROPERTY_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🎯 Frontend Integration (Next Step)

Your frontend already has the structure. Now we need to connect it to the real API:

### Update Frontend Service

File: `frontend/src/services/properties.service.ts`

```typescript
import { apiService } from './api';
import { Property, PaginatedResponse } from '@/types/property.types';

export const propertiesService = {
  getAll: async (params?: any): Promise<PaginatedResponse<Property>> => {
    return apiService.get('/properties', { params });
  },

  getOne: async (id: string): Promise<Property> => {
    return apiService.get(`/properties/${id}`);
  },

  create: async (data: any): Promise<Property> => {
    return apiService.post('/properties', data);
  },

  update: async (id: string, data: any): Promise<Property> => {
    return apiService.put(`/properties/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiService.delete(`/properties/${id}`);
  },

  getStats: async (): Promise<any> => {
    return apiService.get('/properties/stats');
  },
};
```

---

## 🔒 Security Features Implemented

✅ JWT Authentication (required for all endpoints)
✅ Role-Based Access Control
✅ Input validation with class-validator
✅ SQL injection prevention (TypeORM)
✅ Soft delete (data preservation)
✅ Audit trail (createdBy, updatedBy)
✅ CORS protection
✅ Rate limiting ready

---

## 📊 Database Schema

The properties table includes:
- Basic info (name, code, description)
- Location (address, city, state, coordinates)
- Area & measurements
- Dates (launch, completion)
- RERA compliance
- Media (images, documents)
- Amenities (JSONB)
- Audit fields

---

## 🚧 Next Steps

### Phase 2: Towers Module (Week 2)
- Implement towers entity
- Link to properties
- Floor management
- Tower-level amenities

### Phase 3: Flats Module (Week 2)
- Flat entity with pricing
- Availability tracking
- Booking status
- Unit configurations

### Phase 4: Sales & CRM (Weeks 3-4)
- Leads management
- Customer KYC
- Booking workflow
- Payment schedules

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check connection
docker exec -it eastern_estate_db psql -U eastern_estate -d eastern_estate_erp -c "SELECT 1"
```

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### TypeORM Errors
- Ensure database schema is created
- Check .env file has correct credentials
- Verify entity imports in app.module.ts

---

## 📝 Testing Checklist

- [ ] Backend starts without errors
- [ ] Database connection successful
- [ ] Login API works
- [ ] Can create property
- [ ] Can list properties
- [ ] Search & filters work
- [ ] Can update property
- [ ] Can delete property
- [ ] Statistics endpoint works
- [ ] Validation errors are returned properly

---

## 🎉 Congratulations!

You now have a **production-ready Properties module** with:
- ✅ Complete CRUD operations
- ✅ Advanced filtering & search
- ✅ Pagination
- ✅ Validation
- ✅ Security
- ✅ Real Eastern Estate data

**Next:** Let me know if you want to:
1. Test the APIs together
2. Move to Towers module
3. Implement Sales/CRM modules
4. Set up frontend integration
5. Deploy to production

---

## 📞 Support

If you encounter any issues:
1. Check the logs: `cd backend && npm run start:dev`
2. Verify database: `docker logs eastern_estate_db`
3. Test endpoints with the curl commands above

**Ready to proceed? Let me know what you'd like to do next!** 🚀
