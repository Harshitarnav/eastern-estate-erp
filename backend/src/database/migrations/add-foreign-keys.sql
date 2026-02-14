-- Migration: Add Foreign Key Constraints
-- This script adds foreign key constraints to existing tables
-- Run this to enable relationship visualization in the Database Relationships UI

-- Properties → Users (created_by, updated_by)
ALTER TABLE properties 
  DROP CONSTRAINT IF EXISTS fk_properties_created_by,
  ADD CONSTRAINT fk_properties_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE properties 
  DROP CONSTRAINT IF EXISTS fk_properties_updated_by,
  ADD CONSTRAINT fk_properties_updated_by 
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Towers → Properties
ALTER TABLE towers 
  DROP CONSTRAINT IF EXISTS fk_towers_property,
  ADD CONSTRAINT fk_towers_property 
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

ALTER TABLE towers 
  DROP CONSTRAINT IF EXISTS fk_towers_created_by,
  ADD CONSTRAINT fk_towers_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE towers 
  DROP CONSTRAINT IF EXISTS fk_towers_updated_by,
  ADD CONSTRAINT fk_towers_updated_by 
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Flats → Properties, Towers
ALTER TABLE flats 
  DROP CONSTRAINT IF EXISTS fk_flats_property,
  ADD CONSTRAINT fk_flats_property 
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

ALTER TABLE flats 
  DROP CONSTRAINT IF EXISTS fk_flats_tower,
  ADD CONSTRAINT fk_flats_tower 
  FOREIGN KEY (tower_id) REFERENCES towers(id) ON DELETE CASCADE;

ALTER TABLE flats 
  DROP CONSTRAINT IF EXISTS fk_flats_customer,
  ADD CONSTRAINT fk_flats_customer 
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

ALTER TABLE flats 
  DROP CONSTRAINT IF EXISTS fk_flats_created_by,
  ADD CONSTRAINT fk_flats_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE flats 
  DROP CONSTRAINT IF EXISTS fk_flats_updated_by,
  ADD CONSTRAINT fk_flats_updated_by 
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Bookings → Customers, Flats, Properties
ALTER TABLE bookings 
  DROP CONSTRAINT IF EXISTS fk_bookings_customer,
  ADD CONSTRAINT fk_bookings_customer 
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

ALTER TABLE bookings 
  DROP CONSTRAINT IF EXISTS fk_bookings_flat,
  ADD CONSTRAINT fk_bookings_flat 
  FOREIGN KEY (flat_id) REFERENCES flats(id) ON DELETE CASCADE;

ALTER TABLE bookings 
  DROP CONSTRAINT IF EXISTS fk_bookings_property,
  ADD CONSTRAINT fk_bookings_property 
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

ALTER TABLE bookings 
  DROP CONSTRAINT IF EXISTS fk_bookings_created_by,
  ADD CONSTRAINT fk_bookings_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE bookings 
  DROP CONSTRAINT IF EXISTS fk_bookings_updated_by,
  ADD CONSTRAINT fk_bookings_updated_by 
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Leads → Properties
ALTER TABLE leads 
  DROP CONSTRAINT IF EXISTS fk_leads_property,
  ADD CONSTRAINT fk_leads_property 
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL;

ALTER TABLE leads 
  DROP CONSTRAINT IF EXISTS fk_leads_assigned_to,
  ADD CONSTRAINT fk_leads_assigned_to 
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE leads 
  DROP CONSTRAINT IF EXISTS fk_leads_created_by,
  ADD CONSTRAINT fk_leads_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE leads 
  DROP CONSTRAINT IF EXISTS fk_leads_updated_by,
  ADD CONSTRAINT fk_leads_updated_by 
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Payments → Bookings, Customers
ALTER TABLE payments 
  DROP CONSTRAINT IF EXISTS fk_payments_booking,
  ADD CONSTRAINT fk_payments_booking 
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

ALTER TABLE payments 
  DROP CONSTRAINT IF EXISTS fk_payments_customer,
  ADD CONSTRAINT fk_payments_customer 
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

ALTER TABLE payments 
  DROP CONSTRAINT IF EXISTS fk_payments_flat,
  ADD CONSTRAINT fk_payments_flat 
  FOREIGN KEY (flat_id) REFERENCES flats(id) ON DELETE SET NULL;

ALTER TABLE payments 
  DROP CONSTRAINT IF EXISTS fk_payments_created_by,
  ADD CONSTRAINT fk_payments_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE payments 
  DROP CONSTRAINT IF EXISTS fk_payments_updated_by,
  ADD CONSTRAINT fk_payments_updated_by 
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Customers
ALTER TABLE customers 
  DROP CONSTRAINT IF EXISTS fk_customers_created_by,
  ADD CONSTRAINT fk_customers_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE customers 
  DROP CONSTRAINT IF EXISTS fk_customers_updated_by,
  ADD CONSTRAINT fk_customers_updated_by 
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Employees
ALTER TABLE employees 
  DROP CONSTRAINT IF EXISTS fk_employees_user,
  ADD CONSTRAINT fk_employees_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE employees 
  DROP CONSTRAINT IF EXISTS fk_employees_manager,
  ADD CONSTRAINT fk_employees_manager 
  FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;

ALTER TABLE employees 
  DROP CONSTRAINT IF EXISTS fk_employees_created_by,
  ADD CONSTRAINT fk_employees_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE employees 
  DROP CONSTRAINT IF EXISTS fk_employees_updated_by,
  ADD CONSTRAINT fk_employees_updated_by 
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Notifications → Users
ALTER TABLE notifications 
  DROP CONSTRAINT IF EXISTS fk_notifications_user,
  ADD CONSTRAINT fk_notifications_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE notifications 
  DROP CONSTRAINT IF EXISTS fk_notifications_triggered_by,
  ADD CONSTRAINT fk_notifications_triggered_by 
  FOREIGN KEY (triggered_by) REFERENCES users(id) ON DELETE SET NULL;

-- Chat Messages → Users
ALTER TABLE chat_messages 
  DROP CONSTRAINT IF EXISTS fk_chat_messages_sender,
  ADD CONSTRAINT fk_chat_messages_sender 
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE chat_messages 
  DROP CONSTRAINT IF EXISTS fk_chat_messages_receiver,
  ADD CONSTRAINT fk_chat_messages_receiver 
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE;

-- Accounts → Accounts (parent)
ALTER TABLE accounts 
  DROP CONSTRAINT IF EXISTS fk_accounts_parent,
  ADD CONSTRAINT fk_accounts_parent 
  FOREIGN KEY (parent_id) REFERENCES accounts(id) ON DELETE SET NULL;

-- Transactions → Accounts, Users
ALTER TABLE transactions 
  DROP CONSTRAINT IF EXISTS fk_transactions_account,
  ADD CONSTRAINT fk_transactions_account 
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;

ALTER TABLE transactions 
  DROP CONSTRAINT IF EXISTS fk_transactions_created_by,
  ADD CONSTRAINT fk_transactions_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Purchase Orders → Vendors
ALTER TABLE purchase_orders 
  DROP CONSTRAINT IF EXISTS fk_purchase_orders_vendor,
  ADD CONSTRAINT fk_purchase_orders_vendor 
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE;

ALTER TABLE purchase_orders 
  DROP CONSTRAINT IF EXISTS fk_purchase_orders_property,
  ADD CONSTRAINT fk_purchase_orders_property 
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL;

ALTER TABLE purchase_orders 
  DROP CONSTRAINT IF EXISTS fk_purchase_orders_approved_by,
  ADD CONSTRAINT fk_purchase_orders_approved_by 
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE purchase_orders 
  DROP CONSTRAINT IF EXISTS fk_purchase_orders_created_by,
  ADD CONSTRAINT fk_purchase_orders_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Vendor Payments → Vendors, Purchase Orders
ALTER TABLE vendor_payments 
  DROP CONSTRAINT IF EXISTS fk_vendor_payments_vendor,
  ADD CONSTRAINT fk_vendor_payments_vendor 
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE;

ALTER TABLE vendor_payments 
  DROP CONSTRAINT IF EXISTS fk_vendor_payments_purchase_order,
  ADD CONSTRAINT fk_vendor_payments_purchase_order 
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE SET NULL;

ALTER TABLE vendor_payments 
  DROP CONSTRAINT IF EXISTS fk_vendor_payments_created_by,
  ADD CONSTRAINT fk_vendor_payments_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Construction Updates → Properties
ALTER TABLE construction_updates 
  DROP CONSTRAINT IF EXISTS fk_construction_updates_property,
  ADD CONSTRAINT fk_construction_updates_property 
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

ALTER TABLE construction_updates 
  DROP CONSTRAINT IF EXISTS fk_construction_updates_created_by,
  ADD CONSTRAINT fk_construction_updates_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Materials → Properties
ALTER TABLE materials 
  DROP CONSTRAINT IF EXISTS fk_materials_property,
  ADD CONSTRAINT fk_materials_property 
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

ALTER TABLE materials 
  DROP CONSTRAINT IF EXISTS fk_materials_created_by,
  ADD CONSTRAINT fk_materials_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Demand Drafts → Flats, Customers, Bookings
ALTER TABLE demand_drafts 
  DROP CONSTRAINT IF EXISTS fk_demand_drafts_flat,
  ADD CONSTRAINT fk_demand_drafts_flat 
  FOREIGN KEY (flat_id) REFERENCES flats(id) ON DELETE SET NULL;

ALTER TABLE demand_drafts 
  DROP CONSTRAINT IF EXISTS fk_demand_drafts_customer,
  ADD CONSTRAINT fk_demand_drafts_customer 
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

ALTER TABLE demand_drafts 
  DROP CONSTRAINT IF EXISTS fk_demand_drafts_booking,
  ADD CONSTRAINT fk_demand_drafts_booking 
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;

ALTER TABLE demand_drafts 
  DROP CONSTRAINT IF EXISTS fk_demand_drafts_created_by,
  ADD CONSTRAINT fk_demand_drafts_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Vendors
ALTER TABLE vendors 
  DROP CONSTRAINT IF EXISTS fk_vendors_created_by,
  ADD CONSTRAINT fk_vendors_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE vendors 
  DROP CONSTRAINT IF EXISTS fk_vendors_updated_by,
  ADD CONSTRAINT fk_vendors_updated_by 
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Marketing Campaigns
ALTER TABLE marketing_campaigns 
  DROP CONSTRAINT IF EXISTS fk_marketing_campaigns_property,
  ADD CONSTRAINT fk_marketing_campaigns_property 
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL;

ALTER TABLE marketing_campaigns 
  DROP CONSTRAINT IF EXISTS fk_marketing_campaigns_created_by,
  ADD CONSTRAINT fk_marketing_campaigns_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE marketing_campaigns 
  DROP CONSTRAINT IF EXISTS fk_marketing_campaigns_updated_by,
  ADD CONSTRAINT fk_marketing_campaigns_updated_by 
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Print foreign key count after migration
SELECT COUNT(*) as foreign_keys_created 
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
  AND table_schema = 'public';
