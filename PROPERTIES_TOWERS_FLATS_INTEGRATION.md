# Properties-Towers-Flats Module Integration Plan

## Objective
Create a seamless hierarchical navigation and data flow between Properties → Towers → Flats modules, allowing users to drill down from properties to their towers to individual flats.

## Implementation Phases

### Phase 1: Backend Enhancements ✅
**Status:** COMPLETE

- [x] Property entity with towers relationship
- [x] Tower entity with flats relationship  
- [x] Tower count query in properties service
- [x] Flat count query capability

### Phase 2: Properties Module ✅
**Status:** COMPLETE

- [x] Display tower counts in properties list
- [x] Add Towers column to Project Overview table
- [x] Tower counts update dynamically

### Phase 3: Towers Module Enhancement 🔄
**Status:** IN PROGRESS

**Backend Updates:**
- [ ] Update towers service to include property information
- [ ] Add flat count to tower responses
- [ ] Add property filtering capability

**Frontend Updates:**
- [ ] Read existing towers page to understand structure
- [ ] Display property name/code for each tower
- [ ] Group towers by property
- [ ] Add property filter dropdown
- [ ] Display flat count per tower
- [ ] Show "No details filled" for incomplete towers
- [ ] Add "View Flats" button for each tower
- [ ] Add navigation to property detail

### Phase 4: Flats Module Enhancement 📋
**Status:** PLANNED

**Backend Updates:**
- [ ] Update flats service to include tower + property information
- [ ] Add tower and property filtering capability

**Frontend Updates:**
- [ ] Display property → tower hierarchy for each flat
- [ ] Group flats by tower, then by property
- [ ] Add property + tower filter dropdowns
- [ ] Show "No details filled" for incomplete flats
- [ ] Add navigation breadcrumbs
- [ ] Add back navigation to tower/property

### Phase 5: Navigation & UX 📋
**Status:** PLANNED

- [ ] Add "View Towers" button on properties page
- [ ] Add "View Flats" button on towers page
- [ ] Implement breadcrumb navigation
- [ ] Add quick navigation between modules
- [ ] Create property detail page with embedded towers
- [ ] Create tower detail page with embedded flats

## Data Flow Architecture

```
User Journey:
Properties Page → Click Property → See Towers for that Property → Click Tower → See Flats for that Tower

Database Structure:
properties (id, name, property_code, ...)
    ↓ property_id FK
towers (id, name, property_id, ...)
    ↓ tower_id FK
flats (id, flat_number, tower_id, ...)
```

## API Enhancements Needed

### Towers API
- `GET /api/v1/towers` - Include property info in response
- `GET /api/v1/towers?propertyId=xxx` - Filter by property
- Response should include: `propertyName`, `propertyCode`, `flatCount`

### Flats API
- `GET /api/v1/flats` - Include tower + property info
- `GET /api/v1/flats?towerId=xxx` - Filter by tower
- `GET /api/v1/flats?propertyId=xxx` - Filter by property
- Response should include: `towerName`, `propertyName`, `propertyCode`

## UI/UX Patterns

### Towers Page Layout
```
Header: "Towers Management"
Filters: [Property Dropdown] [Status Filter] [Search]

Property: Sunrise Heights (PRJ-001)
┌─────────────────────────────────────┐
│ Tower A        │ 12 Floors │ 48 Flats │
│ Tower B        │ 12 Floors │ 48 Flats │
│ Tower C        │ No details filled    │
└─────────────────────────────────────┘

Property: Garden View Apartments (PRJ-002)
┌─────────────────────────────────────┐
│ Tower 1        │ 15 Floors │ 60 Flats │
└─────────────────────────────────────┘
```

### Flats Page Layout
```
Header: "Flats Management"
Filters: [Property Dropdown] [Tower Dropdown] [Status] [Search]

Property: Sunrise Heights > Tower A
┌─────────────────────────────────────┐
│ Flat 101 │ 2BHK │ Available │ $250k  │
│ Flat 102 │ 3BHK │ Sold      │ $350k  │
└─────────────────────────────────────┘

Property: Sunrise Heights > Tower B
┌─────────────────────────────────────┐
│ Flat 201 │ 2BHK │ Available │ $250k  │
└─────────────────────────────────────┘
```

## Success Criteria

- [ ] User can see which property each tower belongs to
- [ ] User can filter towers by property
- [ ] User can see flat count for each tower
- [ ] User can navigate from property → towers → flats
- [ ] User sees "No details filled" for incomplete records
- [ ] All three modules are interconnected and functional

## Current Progress: Phase 3 - Towers Module
Starting implementation now...
