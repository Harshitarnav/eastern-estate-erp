# Eastern Estate ERP - Project-Wise Data Segregation Guide

## 📋 Overview

This document explains how data is segregated by project (property) across different modules in the Eastern Estate ERP system, ensuring proper isolation and reporting for multi-project operations.

---

## 🎯 Core Concept: Property as Master Entity

In this ERP system, **Property** serves as the master entity that ties all other modules together. Every major operation is linked to a specific property/project.

```
Property (Master)
    ├── Leads (by interested property)
    ├── Construction Projects (1:1 or 1:Many)
    ├── Inventory Items (by project allocation)
    └── Store/Purchase Orders (by project)
```

---

## 🏢 1. Leads Segregation by Project

### Database Structure

**Current Implementation:**
```typescript
// leads table
{
    id: UUID,
    property_id: UUID,  // ✅ Direct link to property
    interested_in: 'Residential' | 'Commercial',
    preferred_flat_type: '1BHK' | '2BHK' | '3BHK',
    // ... other fields
}
```

### How It Works

#### Option 1: Single Property Interest (Current)
```typescript
// Lead interested in ONE specific property
const lead = {
    leadCode: 'LEAD001',
    firstName: 'John',
    lastName: 'Doe',
    property_id: 'property-uuid-here',  // Sunshine Residency
    interestedIn: 'Residential',
    preferred_flat_type: '2BHK'
};
```

#### Option 2: Multiple Properties (Enhancement)
```typescript
// Lead interested in MULTIPLE properties
const lead = {
    leadCode: 'LEAD001',
    firstName: 'John',
    lastName: 'Doe',
    interested_properties: [
        {
            property_id: 'property-1-uuid',  // Sunshine Residency
            priority: 1
        },
        {
            property_id: 'property-2-uuid',  // Green Valley
            priority: 2
        }
    ]
};
```

### Queries for Project-Wise Leads

```typescript
// Get all leads for a specific property
GET /leads?property_id=<property-uuid>

// Get lead statistics by property
GET /leads/statistics?property_id=<property-uuid>

// Service implementation
async findByProperty(propertyId: string): Promise<Lead[]> {
    return this.leadsRepository.find({
        where: { property_id: propertyId },
        order: { createdAt: 'DESC' }
    });
}
```

### Frontend Filtering

```typescript
// Properties page - show leads for this property
<PropertyDetailPage propertyId="xyz">
    <LeadsSection 
        propertyId={propertyId} 
        filterBy="property"
    />
</PropertyDetailPage>

// Dashboard - lead overview by project
const leadsByProject = {
    'Sunshine Residency': 45 leads,
    'Green Valley': 32 leads,
    'Ocean View': 28 leads
};
```

---

## 🏗️ 2. Construction Progress Segregation

### Database Structure

```typescript
// construction_projects table
{
    id: UUID,
    property_id: UUID,  // ✅ Linked to property
    project_code: 'CONST-SUNSHINE-001',
    name: 'Sunshine Residency - Phase 1',
    phase: 'Foundation' | 'Structure' | 'Finishing',
    progress_percentage: 45.5,
    // ... other fields
}
```

### How It Works

#### Scenario: Single Property, Multiple Construction Projects
```typescript
// Property: Sunshine Residency
// Construction Projects:
const projects = [
    {
        id: '1',
        property_id: 'sunshine-uuid',
        project_code: 'CONST-SR-FOUNDATION',
        name: 'Foundation Work',
        phase: 'Foundation',
        progress_percentage: 100,  // Complete
        status: 'Completed'
    },
    {
        id: '2',
        property_id: 'sunshine-uuid',
        project_code: 'CONST-SR-STRUCTURE',
        name: 'Structural Work',
        phase: 'Structure',
        progress_percentage: 65,  // In progress
        status: 'Active'
    },
    {
        id: '3',
        property_id: 'sunshine-uuid',
        project_code: 'CONST-SR-INTERIORS',
        name: 'Interior Finishing',
        phase: 'Finishing',
        progress_percentage: 0,  // Not started
        status: 'Planned'
    }
];
```

### Project-Wise Construction Dashboard

```typescript
// Get construction progress for a property
GET /construction/projects?property_id=<property-uuid>

// Service implementation
async getPropertyProgress(propertyId: string) {
    const projects = await this.constructionRepository.find({
        where: { property_id: propertyId }
    });
    
    // Calculate overall property completion
    const totalProgress = projects.reduce(
        (sum, p) => sum + p.progress_percentage, 
        0
    );
    const averageProgress = totalProgress / projects.length;
    
    return {
        property_id: propertyId,
        total_projects: projects.length,
        overall_progress: averageProgress,
        active_projects: projects.filter(p => p.status === 'Active').length,
        completed_projects: projects.filter(p => p.status === 'Completed').length,
        projects: projects
    };
}
```

### 13 Construction Phases by Project

```typescript
const constructionPhases = [
    { phase: 1, name: 'Site Preparation', status: 'Completed' },
    { phase: 2, name: 'Foundation', status: 'Completed' },
    { phase: 3, name: 'Plinth Beam', status: 'Completed' },
    { phase: 4, name: 'Columns & Beams', status: 'In Progress' },
    { phase: 5, name: 'Slab Work', status: 'Pending' },
    { phase: 6, name: 'Brickwork', status: 'Pending' },
    { phase: 7, name: 'Plastering', status: 'Pending' },
    { phase: 8, name: 'Electrical Work', status: 'Pending' },
    { phase: 9, name: 'Plumbing Work', status: 'Pending' },
    { phase: 10, name: 'Flooring', status: 'Pending' },
    { phase: 11, name: 'Doors & Windows', status: 'Pending' },
    { phase: 12, name: 'Painting', status: 'Pending' },
    { phase: 13, name: 'Final Inspection', status: 'Pending' }
];

// Track per property
GET /construction/phases?property_id=<uuid>
```

---

## 📦 3. Inventory Segregation by Project

### Database Structure

```typescript
// inventory_items table
{
    id: UUID,
    item_code: 'INV-001',
    name: 'Cement Bags (50kg)',
    category: 'Raw Materials',
    current_stock: 500,
    
    // ✅ Project allocation (NEW FIELD TO ADD)
    allocated_to_property_id: UUID,  // Which project this inventory is for
    warehouse_location: 'Warehouse A',
    
    // ... other fields
}
```

### How It Works

#### Scenario: Centralized vs Project-Specific Inventory

**Option 1: Centralized Inventory (Shared Pool)**
```typescript
// All projects draw from same inventory
const item = {
    item_code: 'CEMENT-001',
    name: 'Cement Bags',
    current_stock: 1000,
    allocated_to_property_id: null,  // Available for all projects
    warehouse_location: 'Central Warehouse'
};

// When used in a project, track allocation
const allocation = {
    inventory_item_id: 'cement-001',
    property_id: 'sunshine-uuid',
    quantity_allocated: 200,
    date_allocated: '2025-01-15'
};
```

**Option 2: Project-Specific Inventory (Dedicated)**
```typescript
// Separate inventory for each project
const items = [
    {
        item_code: 'CEMENT-SUNSHINE-001',
        name: 'Cement Bags',
        current_stock: 500,
        allocated_to_property_id: 'sunshine-uuid',  // Dedicated to Sunshine
        warehouse_location: 'Site Warehouse - Sunshine'
    },
    {
        item_code: 'CEMENT-GREENVALLEY-001',
        name: 'Cement Bags',
        current_stock: 300,
        allocated_to_property_id: 'greenvalley-uuid',  // Dedicated to Green Valley
        warehouse_location: 'Site Warehouse - Green Valley'
    }
];
```

### Recommended Approach: Hybrid Model

```typescript
// inventory_items table with allocation tracking
{
    id: UUID,
    item_code: 'INV-001',
    name: 'Cement Bags',
    category: 'Raw Materials',
    
    // Total stock
    total_stock: 1000,
    available_stock: 400,  // Not allocated
    
    // Allocation by project (JSONB field)
    project_allocations: [
        {
            property_id: 'sunshine-uuid',
            property_name: 'Sunshine Residency',
            allocated_quantity: 300,
            date_allocated: '2025-01-15'
        },
        {
            property_id: 'greenvalley-uuid',
            property_name: 'Green Valley',
            allocated_quantity: 300,
            date_allocated: '2025-01-15'
        }
    ]
}
```

### Queries for Project-Wise Inventory

```typescript
// Get inventory for a specific project
GET /inventory?property_id=<property-uuid>

// Get inventory allocation summary
GET /inventory/allocations?property_id=<property-uuid>

// Service implementation
async getPropertyInventory(propertyId: string) {
    // Option 1: If using dedicated inventory
    return this.inventoryRepository.find({
        where: { allocated_to_property_id: propertyId }
    });
    
    // Option 2: If using allocation tracking
    const items = await this.inventoryRepository.find();
    return items.map(item => ({
        ...item,
        allocated_to_project: item.project_allocations?.find(
            a => a.property_id === propertyId
        )?.allocated_quantity || 0
    }));
}
```

---

## 🛒 4. Store/Purchase Orders Segregation

### Database Structure

```typescript
// purchase_orders table
{
    id: UUID,
    po_number: 'PO-2025-001',
    property_id: UUID,  // ✅ Which project this PO is for
    supplier_name: 'ABC Suppliers',
    items: [
        {
            item_name: 'Cement',
            quantity: 500,
            unit_price: 400,
            total: 200000
        }
    ],
    total_amount: 200000,
    // ... other fields
}
```

### How It Works

#### Project-Specific Purchase Orders
```typescript
// PO for Sunshine Residency
const po1 = {
    po_number: 'PO-SUNSHINE-001',
    property_id: 'sunshine-uuid',
    property_name: 'Sunshine Residency',
    supplier_name: 'ABC Construction Supplies',
    items: [
        { item: 'Cement 50kg', quantity: 500, price: 400 },
        { item: 'Steel Rods', quantity: 100, price: 5000 }
    ],
    total_amount: 700000,
    status: 'Approved',
    created_for_project: 'Sunshine Residency Construction'
};

// PO for Green Valley
const po2 = {
    po_number: 'PO-GREENVALLEY-001',
    property_id: 'greenvalley-uuid',
    property_name: 'Green Valley',
    supplier_name: 'XYZ Building Materials',
    items: [
        { item: 'Bricks', quantity: 10000, price: 8 },
        { item: 'Sand', quantity: 100, price: 500 }
    ],
    total_amount: 130000,
    status: 'Pending Approval',
    created_for_project: 'Green Valley Phase 2'
};
```

### Budget Tracking by Project

```typescript
// Track procurement budget by project
const projectBudget = {
    property_id: 'sunshine-uuid',
    property_name: 'Sunshine Residency',
    
    // Budget allocation
    total_budget: 50000000,  // 5 Crores
    construction_budget: 35000000,  // 3.5 Crores
    materials_budget: 15000000,  // 1.5 Crores
    
    // Spending
    total_spent: 12000000,  // 1.2 Crores
    committed (POs approved): 5000000,  // 50 Lakhs
    available: 33000000,  // 3.3 Crores
    
    // Purchase orders
    total_pos: 45,
    approved_pos: 30,
    pending_pos: 10,
    rejected_pos: 5
};
```

### Queries for Project-Wise Procurement

```typescript
// Get all POs for a property
GET /purchase-orders?property_id=<property-uuid>

// Get procurement summary
GET /purchase-orders/summary?property_id=<property-uuid>

// Service implementation
async getProjectProcurement(propertyId: string) {
    const pos = await this.poRepository.find({
        where: { property_id: propertyId },
        order: { created_at: 'DESC' }
    });
    
    const summary = {
        total_pos: pos.length,
        total_value: pos.reduce((sum, po) => sum + po.total_amount, 0),
        by_status: {
            draft: pos.filter(p => p.status === 'Draft').length,
            pending: pos.filter(p => p.status === 'Pending').length,
            approved: pos.filter(p => p.status === 'Approved').length,
            received: pos.filter(p => p.status === 'Received').length,
            cancelled: pos.filter(p => p.status === 'Cancelled').length
        }
    };
    
    return {
        property_id: propertyId,
        summary,
        purchase_orders: pos
    };
}
```

---

## 📊 5. Project-Wise Dashboard & Reports

### Unified Project View

```typescript
// Get complete project overview
GET /properties/:id/dashboard

// Response includes all related data
{
    property: {
        id: 'uuid',
        name: 'Sunshine Residency',
        total_area: 100000,
        total_flats: 200
    },
    
    leads: {
        total: 45,
        qualified: 20,
        converted: 10,
        conversion_rate: 22.2
    },
    
    construction: {
        overall_progress: 65,
        active_projects: 3,
        completed_phases: 8,
        remaining_phases: 5,
        expected_completion: '2025-12-31'
    },
    
    inventory: {
        total_items: 150,
        total_value: 5000000,
        low_stock_items: 12,
        allocated_to_project: 3500000
    },
    
    procurement: {
        total_pos: 45,
        total_value: 12000000,
        pending_approval: 10,
        pending_delivery: 8
    },
    
    sales: {
        total_bookings: 50,
        total_revenue: 250000000,
        available_units: 150,
        occupancy_rate: 25
    }
}
```

### Project Comparison Report

```typescript
// Compare multiple projects
GET /reports/project-comparison?property_ids=uuid1,uuid2,uuid3

// Response
{
    projects: [
        {
            name: 'Sunshine Residency',
            construction_progress: 65,
            sales_percentage: 25,
            budget_utilization: 40,
            lead_conversion: 22.2
        },
        {
            name: 'Green Valley',
            construction_progress: 80,
            sales_percentage: 60,
            budget_utilization: 65,
            lead_conversion: 35.5
        },
        {
            name: 'Ocean View',
            construction_progress: 45,
            sales_percentage: 15,
            budget_utilization: 30,
            lead_conversion: 18.8
        }
    ]
}
```

---

## 🔧 Implementation Recommendations

### 1. Database Enhancements

#### Add property_id to all relevant tables:
```sql
-- Already have property_id:
-- ✅ leads.property_id
-- ✅ flats.property_id
-- ✅ bookings.property_id
-- ✅ construction_projects.property_id

-- Need to add:
ALTER TABLE inventory_items ADD COLUMN property_id UUID REFERENCES properties(id);
ALTER TABLE purchase_orders ADD COLUMN property_id UUID REFERENCES properties(id);

-- Add indexes for performance
CREATE INDEX idx_inventory_items_property_id ON inventory_items(property_id);
CREATE INDEX idx_purchase_orders_property_id ON purchase_orders(property_id);
```

### 2. Backend Service Updates

```typescript
// Add property filter to all services
class LeadsService {
    async findAll(query: QueryDto) {
        const { property_id, ...otherFilters } = query;
        
        const where: any = {};
        if (property_id) {
            where.property_id = property_id;
        }
        
        return this.repository.find({ where, ...otherFilters });
    }
}

// Apply same pattern to:
// - ConstructionService
// - InventoryService
// - PurchaseOrdersService
```

### 3. Frontend Property Selector

```typescript
// Global property selector component
<PropertySelector 
    value={selectedProperty}
    onChange={(property) => {
        setSelectedProperty(property);
        // Refresh all data for new property
        fetchLeads(property.id);
        fetchConstruction(property.id);
        fetchInventory(property.id);
        fetchPurchaseOrders(property.id);
    }}
/>

// Usage in pages
<ConstructionPage propertyId={selectedProperty.id} />
<InventoryPage propertyId={selectedProperty.id} />
<PurchaseOrdersPage propertyId={selectedProperty.id} />
```

### 4. User Access by Project

```typescript
// Optional: Restrict users to specific projects
const userProjectAccess = {
    user_id: 'user-uuid',
    accessible_properties: [
        'property-1-uuid',  // Can access Sunshine Residency
        'property-2-uuid'   // Can access Green Valley
    ]
};

// Middleware to check access
async checkProjectAccess(userId: string, propertyId: string) {
    const access = await this.accessRepository.findOne({
        where: {
            user_id: userId,
            property_id: propertyId
        }
    });
    
    if (!access) {
        throw new ForbiddenException('No access to this property');
    }
}
```

---

## 📈 Example: Complete Project Flow

### Scenario: New Property "Sunrise Apartments"

```typescript
// 1. Create Property
POST /properties
{
    property_code: 'SUNRISE-2025',
    name: 'Sunrise Apartments',
    total_area: 150000,
    total_flats: 300
}
// Response: property_id = 'sunrise-uuid'

// 2. Create Construction Project
POST /construction/projects
{
    property_id: 'sunrise-uuid',
    project_code: 'CONST-SUNRISE-001',
    name: 'Sunrise - Foundation Phase',
    phase: 'Foundation',
    estimated_budget: 15000000
}

// 3. Create Purchase Order for this project
POST /purchase-orders
{
    property_id: 'sunrise-uuid',  // ✅ Linked to property
    po_number: 'PO-SUNRISE-001',
    supplier_name: 'ABC Suppliers',
    items: [
        { item: 'Cement', quantity: 1000, price: 400 }
    ],
    total_amount: 400000
}

// 4. Allocate Inventory to project
POST /inventory/allocate
{
    inventory_item_id: 'cement-item-uuid',
    property_id: 'sunrise-uuid',  // ✅ Allocate to Sunrise
    quantity: 500
}

// 5. Generate Leads for this property
POST /leads
{
    property_id: 'sunrise-uuid',  // ✅ Interested in Sunrise
    first_name: 'John',
    last_name: 'Doe',
    preferred_flat_type: '2BHK'
}

// 6. View Project Dashboard
GET /properties/sunrise-uuid/dashboard
// Returns complete overview: leads, construction, inventory, procurement
```

---

## ✅ Benefits of Project Segregation

### 1. Financial Clarity
- Track budget per project
- Calculate ROI per project
- Identify cost overruns early

### 2. Operational Efficiency
- Allocate resources properly
- Avoid inventory mix-ups
- Better procurement planning

### 3. Better Reporting
- Project-wise P&L
- Construction progress by project
- Sales performance by project

### 4. Stakeholder Management
- Investor reports per project
- Contractor assignments per project
- Team accountability

---

## 🎯 Quick Reference

| Module | Segregation Field | Filter Query |
|--------|------------------|--------------|
| **Leads** | `property_id` | `/leads?property_id=<uuid>` |
| **Construction** | `property_id` | `/construction/projects?property_id=<uuid>` |
| **Inventory** | `property_id` (to add) | `/inventory?property_id=<uuid>` |
| **Purchase Orders** | `property_id` (to add) | `/purchase-orders?property_id=<uuid>` |
| **Bookings** | `property_id` | `/bookings?property_id=<uuid>` |
| **Payments** | Via `booking.property_id` | `/payments?property_id=<uuid>` |

---

## 🚀 Implementation Checklist

- [ ] Add `property_id` to inventory_items table
- [ ] Add `property_id` to purchase_orders table
- [ ] Add database indexes for performance
- [ ] Update all services to filter by property
- [ ] Add property selector to frontend
- [ ] Update all pages to use property filter
- [ ] Add project dashboard endpoint
- [ ] Add project comparison reports
- [ ] Update documentation
- [ ] Test thoroughly

---

**With this segregation strategy, you can manage multiple properties efficiently with clear data isolation and comprehensive project-wise reporting!** 🎉
