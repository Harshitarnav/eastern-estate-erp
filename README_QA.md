# QA / UAT Checklist (Live & Local)

Use this as a quick guide to verify the app on the live environment. For local runs, see the “Local Setup” section.

## Local Setup (optional)
```bash
# Backend
cd backend
export CORS_ORIGINS=http://localhost:3000
npm run start:dev

# Frontend
cd ../frontend
export NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
npm run dev
```
Ensure the frontend calls the live API (not localhost) when testing live.

## Login & Navigation
- Log in with an admin/super-admin account.
- Confirm the property selector loads; “All Properties” works where supported.
- No CORS or localhost calls in the browser Network tab.
    
## Property Inventory
- Create project → property → tower → flat; no validation errors.
- Lists and details show saved data; edits persist.
- Flat edit: amenities/options save without split/array errors.

## Customers
- Create customer with phone only (email is optional) and pick a property.

- `/customers` list: property filter works; name/contact/address visible.
- `/customers/:id`: personal details (address, phone, email) display; updates persist.

## Bookings
- `/bookings`: property filter dropdown works; list updates.
- Create booking with token/payment mode, loan info, nominees/co-applicants, special terms, docs.
- `/bookings/:id`: see customer contact, property/flat, financials, payment refs (RTGS/UTR/cheque/bank/branch), loan dates, nominees/co-applicant, special terms, docs.
- Edit booking and confirm updates render.

## Leads & CRM
- Create lead (valid email); appears in `/leads` with name/contact.
- Property filter and “All properties” work; no 403/forbidden on users fetch when authorized.
- Follow-up date picker works.

## Sales Dashboard
- Admin/GM: property filter (and agent filter if available) update metrics.
- Agent: view restricted to self; property selection respected.

## Users/Employees
- Admin/super-admin can open users list (no 403) and view/manage users.

## General Checks
- No runtime console errors on key pages.
- Pagination works on long lists.
- No duplicate code errors for customers/leads; codes increment per month.

## If Something Fails
Capture:
- Route/page and action performed
- Exact error message/HTTP status
- Data used (property/customer/booking IDs, etc.)
- Screenshot or console/network log if relevant.
