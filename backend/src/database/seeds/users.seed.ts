import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * User and Role Seed Data for Eastern Estate ERP
 * 
 * This seed creates:
 * 1. Default roles with permissions
 * 2. Sample users for each role
 * 3. Role-permission mappings
 * 4. User-role assignments
 */

export class UserSeeder {
  constructor(private dataSource: DataSource) {}

  async run() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Hash password for all test users
      const defaultPassword = await bcrypt.hash('Password@123', 10);

      console.log('🌱 Starting user seed...');

      // 1. Create Roles (if not exists)
      console.log('📝 Creating roles...');
      const roles = [
        { name: 'super_admin', displayName: 'Super Administrator', description: 'Full system access with all permissions', isSystem: true },
        { name: 'admin', displayName: 'Administrator', description: 'Administrative access to most features', isSystem: true },
        { name: 'accountant', displayName: 'Accountant', description: 'Accounting and finance operations', isSystem: false },
        { name: 'sales_manager', displayName: 'Sales Manager', description: 'Sales team management and operations', isSystem: false },
        { name: 'sales_executive', displayName: 'Sales Executive', description: 'Sales operations and lead management', isSystem: false },
        { name: 'marketing_manager', displayName: 'Marketing Manager', description: 'Marketing campaigns and lead generation', isSystem: false },
        { name: 'construction_manager', displayName: 'Construction Manager', description: 'Construction and project management', isSystem: false },
        { name: 'store_keeper', displayName: 'Store Keeper', description: 'Store and inventory management', isSystem: false },
        { name: 'hr_manager', displayName: 'HR Manager', description: 'HR operations and employee management', isSystem: false },
        { name: 'customer', displayName: 'Customer', description: 'Customer portal access', isSystem: true },
        { name: 'broker', displayName: 'Broker', description: 'Broker portal access', isSystem: true },
      ];

      const roleIds = {};
      for (const role of roles) {
        const result = await queryRunner.query(
          `INSERT INTO roles (name, display_name, description, is_system, is_active) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (name) DO UPDATE SET 
             display_name = $2, description = $3 
           RETURNING id`,
          [role.name, role.displayName, role.description, role.isSystem, true]
        );
        roleIds[role.name] = result[0].id;
        console.log(`✅ Role created/updated: ${role.displayName}`);
      }

      // 2. Create Permissions (if not exists)
      console.log('📝 Creating permissions...');
      const permissions = [
        // User Management
        { name: 'users.view', displayName: 'View Users', module: 'users', description: 'View user list and details' },
        { name: 'users.create', displayName: 'Create Users', module: 'users', description: 'Create new users' },
        { name: 'users.update', displayName: 'Update Users', module: 'users', description: 'Update user information' },
        { name: 'users.delete', displayName: 'Delete Users', module: 'users', description: 'Delete users' },
        
        // Property Management
        { name: 'properties.view', displayName: 'View Properties', module: 'properties', description: 'View property listings' },
        { name: 'properties.create', displayName: 'Create Properties', module: 'properties', description: 'Create new properties' },
        { name: 'properties.update', displayName: 'Update Properties', module: 'properties', description: 'Update property details' },
        { name: 'properties.delete', displayName: 'Delete Properties', module: 'properties', description: 'Delete properties' },
        
        // Inventory Management
        { name: 'inventory.view', displayName: 'View Inventory', module: 'inventory', description: 'View flats and units' },
        { name: 'inventory.create', displayName: 'Create Inventory', module: 'inventory', description: 'Add flats and units' },
        { name: 'inventory.update', displayName: 'Update Inventory', module: 'inventory', description: 'Update inventory status' },
        { name: 'inventory.delete', displayName: 'Delete Inventory', module: 'inventory', description: 'Delete inventory items' },
        
        // Lead Management
        { name: 'leads.view', displayName: 'View Leads', module: 'sales', description: 'View lead information' },
        { name: 'leads.create', displayName: 'Create Leads', module: 'sales', description: 'Create new leads' },
        { name: 'leads.update', displayName: 'Update Leads', module: 'sales', description: 'Update lead status' },
        { name: 'leads.delete', displayName: 'Delete Leads', module: 'sales', description: 'Delete leads' },
        { name: 'leads.assign', displayName: 'Assign Leads', module: 'sales', description: 'Assign leads to team members' },
        
        // Booking Management
        { name: 'bookings.view', displayName: 'View Bookings', module: 'sales', description: 'View booking information' },
        { name: 'bookings.create', displayName: 'Create Bookings', module: 'sales', description: 'Create new bookings' },
        { name: 'bookings.update', displayName: 'Update Bookings', module: 'sales', description: 'Update booking details' },
        { name: 'bookings.cancel', displayName: 'Cancel Bookings', module: 'sales', description: 'Cancel bookings' },
        
        // Payment Management
        { name: 'payments.view', displayName: 'View Payments', module: 'payments', description: 'View payment records' },
        { name: 'payments.create', displayName: 'Create Payments', module: 'payments', description: 'Record new payments' },
        { name: 'payments.update', displayName: 'Update Payments', module: 'payments', description: 'Update payment status' },
        { name: 'payments.delete', displayName: 'Delete Payments', module: 'payments', description: 'Delete payment records' },
        
        // Customer Management
        { name: 'customers.view', displayName: 'View Customers', module: 'customers', description: 'View customer information' },
        { name: 'customers.create', displayName: 'Create Customers', module: 'customers', description: 'Create customer records' },
        { name: 'customers.update', displayName: 'Update Customers', module: 'customers', description: 'Update customer details' },
        
        // Reporting
        { name: 'reports.view', displayName: 'View Reports', module: 'reports', description: 'View system reports' },
        { name: 'reports.export', displayName: 'Export Reports', module: 'reports', description: 'Export reports to various formats' },
        { name: 'reports.financial', displayName: 'Financial Reports', module: 'reports', description: 'Access financial reports' },
        
        // Settings
        { name: 'settings.view', displayName: 'View Settings', module: 'settings', description: 'View system settings' },
        { name: 'settings.update', displayName: 'Update Settings', module: 'settings', description: 'Modify system settings' },
      ];

      const permissionIds = {};
      for (const permission of permissions) {
        const result = await queryRunner.query(
          `INSERT INTO permissions (name, display_name, module, description) 
           VALUES ($1, $2, $3, $4) 
           ON CONFLICT (name) DO UPDATE SET 
             display_name = $2, module = $3, description = $4 
           RETURNING id`,
          [permission.name, permission.displayName, permission.module, permission.description]
        );
        permissionIds[permission.name] = result[0].id;
      }
      console.log(`✅ Created/updated ${Object.keys(permissionIds).length} permissions`);

      // 3. Assign Permissions to Roles
      console.log('📝 Assigning permissions to roles...');
      
      const rolePermissions = {
        super_admin: Object.keys(permissionIds), // All permissions
        admin: [
          'users.view', 'users.create', 'users.update',
          'properties.view', 'properties.create', 'properties.update', 'properties.delete',
          'inventory.view', 'inventory.create', 'inventory.update', 'inventory.delete',
          'leads.view', 'leads.create', 'leads.update', 'leads.assign',
          'bookings.view', 'bookings.create', 'bookings.update', 'bookings.cancel',
          'payments.view', 'payments.create', 'payments.update',
          'customers.view', 'customers.create', 'customers.update',
          'reports.view', 'reports.export', 'reports.financial',
          'settings.view',
        ],
        accountant: [
          'properties.view', 'inventory.view',
          'bookings.view', 'bookings.update',
          'payments.view', 'payments.create', 'payments.update',
          'customers.view',
          'reports.view', 'reports.export', 'reports.financial',
        ],
        sales_manager: [
          'properties.view', 'inventory.view', 'inventory.update',
          'leads.view', 'leads.create', 'leads.update', 'leads.assign',
          'bookings.view', 'bookings.create', 'bookings.update',
          'payments.view',
          'customers.view', 'customers.create', 'customers.update',
          'reports.view', 'reports.export',
        ],
        sales_executive: [
          'properties.view', 'inventory.view',
          'leads.view', 'leads.create', 'leads.update',
          'bookings.view', 'bookings.create',
          'customers.view', 'customers.create', 'customers.update',
        ],
        marketing_manager: [
          'properties.view', 'inventory.view',
          'leads.view', 'leads.create', 'leads.update', 'leads.assign',
          'customers.view',
          'reports.view',
        ],
        construction_manager: [
          'properties.view', 'properties.update',
          'inventory.view', 'inventory.update',
          'reports.view',
        ],
        store_keeper: [
          'inventory.view', 'inventory.update',
        ],
        hr_manager: [
          'users.view', 'users.create', 'users.update',
          'reports.view',
        ],
        customer: [
          'bookings.view',
          'payments.view',
        ],
        broker: [
          'properties.view', 'inventory.view',
          'leads.view', 'leads.create',
          'bookings.view',
          'customers.view',
        ],
      };

      for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
        for (const permName of permissionNames) {
          if (permissionIds[permName]) {
            await queryRunner.query(
              `INSERT INTO role_permissions (role_id, permission_id) 
               VALUES ($1, $2) 
               ON CONFLICT DO NOTHING`,
              [roleIds[roleName], permissionIds[permName]]
            );
          }
        }
        console.log(`✅ Assigned ${permissionNames.length} permissions to ${roleName}`);
      }

      // 4. Create Sample Users
      console.log('📝 Creating sample users...');
      const users = [
        // === GOOGLE SSO USERS (@eecd.in domain) ===
        {
          email: 'info@eecd.in',
          username: 'info',
          firstName: 'Super',
          lastName: 'Admin',
          phone: '+91-9876543210',
          role: 'super_admin',
        },
        {
          email: 'hr@eecd.in',
          username: 'hr',
          firstName: 'HR',
          lastName: 'Manager',
          phone: '+91-9876543211',
          role: 'admin',
        },
        // === LEGACY USERS (@easternestates.com domain - for backward compatibility) ===
        {
          email: 'superadmin@easternestates.com',
          username: 'superadmin',
          firstName: 'Super',
          lastName: 'Admin',
          phone: '+91-9876543210',
          role: 'super_admin',
        },
        {
          email: 'admin@easternestates.com',
          username: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          phone: '+91-9876543211',
          role: 'admin',
        },
        {
          email: 'accountant@easternestates.com',
          username: 'accountant',
          firstName: 'John',
          lastName: 'Smith',
          phone: '+91-9876543212',
          role: 'accountant',
        },
        {
          email: 'salesmanager@easternestates.com',
          username: 'salesmanager',
          firstName: 'Sarah',
          lastName: 'Johnson',
          phone: '+91-9876543213',
          role: 'sales_manager',
        },
        {
          email: 'salesexec@easternestates.com',
          username: 'salesexec',
          firstName: 'Mike',
          lastName: 'Williams',
          phone: '+91-9876543214',
          role: 'sales_executive',
        },
        {
          email: 'marketing@easternestates.com',
          username: 'marketing',
          firstName: 'Emily',
          lastName: 'Davis',
          phone: '+91-9876543215',
          role: 'marketing_manager',
        },
        {
          email: 'construction@easternestates.com',
          username: 'construction',
          firstName: 'David',
          lastName: 'Brown',
          phone: '+91-9876543216',
          role: 'construction_manager',
        },
        {
          email: 'storekeeper@easternestates.com',
          username: 'storekeeper',
          firstName: 'Robert',
          lastName: 'Wilson',
          phone: '+91-9876543217',
          role: 'store_keeper',
        },
        {
          email: 'hr@easternestates.com',
          username: 'hrmanager',
          firstName: 'Lisa',
          lastName: 'Anderson',
          phone: '+91-9876543218',
          role: 'hr_manager',
        },
      ];

      for (const user of users) {
        // First, try to find existing user by email or username
        const existingUser = await queryRunner.query(
          `SELECT id FROM users WHERE email = $1 OR username = $2`,
          [user.email, user.username]
        );

        let userId;
        if (existingUser.length > 0) {
          // Update existing user
          userId = existingUser[0].id;
          await queryRunner.query(
            `UPDATE users 
             SET password_hash = $1, first_name = $2, last_name = $3, phone = $4, is_active = $5, is_verified = $6
             WHERE id = $7`,
            [defaultPassword, user.firstName, user.lastName, user.phone, true, true, userId]
          );
          console.log(`✅ Updated user: ${user.email} (${user.role})`);
        } else {
          // Create new user
          const userResult = await queryRunner.query(
            `INSERT INTO users (email, username, password_hash, first_name, last_name, phone, is_active, is_verified, email_verified_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
             RETURNING id`,
            [user.email, user.username, defaultPassword, user.firstName, user.lastName, user.phone, true, true]
          );
          userId = userResult[0].id;
          console.log(`✅ Created user: ${user.email} (${user.role})`);
        }

        // Assign role to user (will skip if already exists)
        await queryRunner.query(
          `INSERT INTO user_roles (user_id, role_id) 
           VALUES ($1, $2) 
           ON CONFLICT DO NOTHING`,
          [userId, roleIds[user.role]]
        );
      }

      await queryRunner.commitTransaction();
      console.log('✅ User seed completed successfully!');
      console.log('\n📋 LOGIN CREDENTIALS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      users.forEach(user => {
        console.log(`${user.role.toUpperCase().padEnd(20)} | Email: ${user.email.padEnd(35)} | Password: Password@123`);
      });
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error seeding users:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

/**
 * SQL Script for direct database seeding
 * Run this if you prefer SQL over TypeORM seeding
 */
export const generateUserSeedSQL = () => {
  return `
-- User Seed Data
-- Default password for all users: Password@123
-- Password hash: $2b$10$YourHashedPasswordHere

DO $$
DECLARE
    v_password_hash TEXT := '$2b$10$8ZqrKxZqQxXJZqYqKqJqNeZqKqJqNeZqKqJqNeZqKqJqNeZqKqJqN'; -- Password@123
    v_super_admin_role_id UUID;
    v_admin_role_id UUID;
    v_accountant_role_id UUID;
    v_sales_manager_role_id UUID;
    v_sales_executive_role_id UUID;
    v_user_id UUID;
BEGIN
    -- Get role IDs
    SELECT id INTO v_super_admin_role_id FROM roles WHERE name = 'super_admin';
    SELECT id INTO v_admin_role_id FROM roles WHERE name = 'admin';
    SELECT id INTO v_accountant_role_id FROM roles WHERE name = 'accountant';
    SELECT id INTO v_sales_manager_role_id FROM roles WHERE name = 'sales_manager';
    SELECT id INTO v_sales_executive_role_id FROM roles WHERE name = 'sales_executive';

    -- Super Admin
    INSERT INTO users (email, username, password_hash, first_name, last_name, phone, is_active, is_verified, email_verified_at)
    VALUES ('superadmin@easternestates.com', 'superadmin', v_password_hash, 'Super', 'Admin', '+91-9876543210', true, true, NOW())
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_user_id;
    INSERT INTO user_roles (user_id, role_id) VALUES (v_user_id, v_super_admin_role_id) ON CONFLICT DO NOTHING;

    -- Admin
    INSERT INTO users (email, username, password_hash, first_name, last_name, phone, is_active, is_verified, email_verified_at)
    VALUES ('admin@easternestates.com', 'admin', v_password_hash, 'Admin', 'User', '+91-9876543211', true, true, NOW())
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_user_id;
    INSERT INTO user_roles (user_id, role_id) VALUES (v_user_id, v_admin_role_id) ON CONFLICT DO NOTHING;
END $$;

SELECT 'User seed data created successfully!' AS message;
`;
};
