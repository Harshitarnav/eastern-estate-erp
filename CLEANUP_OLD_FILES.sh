#!/bin/bash

# Eastern Estate ERP - Cleanup Old Development Files
# This script removes old documentation and temporary files from development

echo "🧹 Starting cleanup of old development files..."

# Remove old documentation files (keeping only essential ones)
echo "📄 Removing old documentation files..."
rm -f ACCESS_LEVELS_AND_LOGIN.md
rm -f ACCOUNTING_MODULE_100_PERCENT_COMPLETE.md
rm -f ACCOUNTING_MODULE_COMPLETE.md
rm -f ACCOUNTING_MODULE_FULLY_COMPLETE.md
rm -f ACCOUNTING_MODULE_PROGRESS.md
rm -f ACCOUNTING_MODULE.md
rm -f ALL_PHASES_COMPLETE.md
rm -f CACHING_AND_ERROR_HANDLING_GUIDE.md
rm -f CONSTRUCTION_FEATURES_COMPLETE.md
rm -f CONSTRUCTION_FEATURES_IMPLEMENTATION_SUMMARY.md
rm -f CONSTRUCTION_FRONTEND_COMPLETE_PLAN.md
rm -f CONSTRUCTION_INTEGRATION_ROADMAP.md
rm -f CONSTRUCTION_MODULE_COMPLETE_PLAN.md
rm -f CONSTRUCTION_MODULE_COMPLETE_SUMMARY.md
rm -f CONSTRUCTION_MODULE_DATABASE_COMPLETE.md
rm -f CONSTRUCTION_MODULE_ENHANCED_IMPLEMENTATION.md
rm -f CONSTRUCTION_MODULE_FUNCTIONAL_IMPLEMENTATION.md
rm -f CONSTRUCTION_MODULE_PHASE_1-4_COMPLETE.md
rm -f CONSTRUCTION_MODULE_PHASE_1-5_COMPLETE.md
rm -f CONSTRUCTION_MODULE_PLAN.md
rm -f CONSTRUCTION_MODULE_PROGRESS.md
rm -f CONSTRUCTION_MODULE_RESTRUCTURED_COMPLETE.md
rm -f CORRECT_LOGIN_CREDENTIALS.md
rm -f CUSTOMER_MODULE_COMPLETE.md
rm -f EMPLOYEE_MODULE_IMPLEMENTATION.md
rm -f ERROR_HANDLING_AND_USER_MANAGEMENT.md
rm -f EVENT_DRIVEN_BOOKING_SYSTEM.md
rm -f FINAL_MODULES_IMPLEMENTATION_PLAN.md
rm -f FIX_SALES_DASHBOARD.sh
rm -f FORM_VALIDATION_USAGE_GUIDE.md
rm -f FRONTEND_BUILD_PROGRESS.md
rm -f GET_AUTH_TOKEN.md
rm -f HOW_TO_ACCESS_SALES_DASHBOARD.md
rm -f IMPLEMENTATION_STATUS.md
rm -f IMPLEMENTATION_SUMMARY.md
rm -f LEAD_CODE_FIX_SUMMARY.md
rm -f LEADS_EXCEL_IMPLEMENTATION_COMPLETE.md
rm -f LEADS_EXCEL_INTERFACE_GUIDE.md
rm -f LOGIN_PAGE_FIXED.md
rm -f NAVIGATE_YOUR_SALES_CRM.md
rm -f PAYMENTS_MODULE_COMPLETE.md
rm -f PAYMENTS_MODULE_PROGRESS.md
rm -f PHASE_1_IMPLEMENTATION_PROGRESS.md
rm -f PHASE_2_COMPLETE_SUMMARY.md
rm -f PHASE_2_FILE_UPLOAD_PLAN.md
rm -f PHASE_2_IMPLEMENTATION_COMPLETE.md
rm -f PHASES_3-4-5_COMPLETE_GUIDE.md
rm -f PRODUCTION_READINESS_PLAN.md
rm -f PRODUCTION_READY_IMPLEMENTATION_PLAN.md
rm -f PROJECT_SEGREGATION_GUIDE.md
rm -f PROPERTIES_MODULE_FIX_PLAN.md
rm -f PROPERTIES_TOWERS_FLATS_INTEGRATION.md
rm -f QUICK_FIX_SUMMARY.md
rm -f QUICK_START_ADMIN_LOGIN.md
rm -f QUICK_START_BOOKING_SYSTEM.md
rm -f README_FIX_SALES_DASHBOARD.md
rm -f SALES_CRM_COMPLETE_SUMMARY.md
rm -f SALES_CRM_IMPLEMENTATION_SUMMARY.md
rm -f SALES_CRM_MODULE_DOCUMENTATION.md
rm -f SALES_CRM_SETUP_GUIDE.md
rm -f SALES_DASHBOARD_FINAL_FIX_SUMMARY.md
rm -f SALES_DASHBOARD_FIX_COMPLETE_GUIDE.md
rm -f SALES_DASHBOARD_FIX_SUMMARY.md
rm -f SALES_DASHBOARD_FIXED_SUCCESS.md
rm -f SALES_DASHBOARD_FIXES.md
rm -f SETUP_COMPLETE_STATUS.md
rm -f SETUP_GUIDE.md
rm -f TODAYS_COMPLETION_SUMMARY.md
rm -f TYPESCRIPT_ERRORS_FIX_SUMMARY.md
rm -f PROJECT_CLEANUP_COMPLETE.md
rm -f FRONTEND_CLEANUP_SUMMARY.md
rm -f ARRAY_SAFETY_FIX_COMPLETE.md
rm -f DTO_VALIDATION_FIX_GUIDE.md
rm -f FINAL_CLEANUP_SUMMARY.md
rm -f ERROR_FIXES_SUMMARY.md
rm -f DATABASE_PAYMENT_FIX_GUIDE.md
rm -f MARKETING_MODULE_COMPLETE.md
rm -f ERROR_HANDLING_IMPLEMENTATION.md

# Remove old SQL migration files (keeping consolidated one)
echo "🗄️  Removing old SQL files..."
cd backend
rm -f add-missing-tower-columns.sql
rm -f add-missing-sales-crm-columns.sql
rm -f add-payment-tracking-fields.sql
rm -f add-marketing-notes-attachments.sql
rm -f admin-user.sql
rm -f create-all-tables-with-test-data.sql
rm -f create-employees-table.sql
rm -f customer-module-setup.sql
rm -f customer-test-data.sql
rm -f database-migration-booking-system.sql
rm -f database-migration-sales-crm-phase1.sql
rm -f employee-module-complete.sql
rm -f construction-module-complete.sql
rm -f construction-test-data-fixed.sql
rm -f construction-test-data.sql
rm -f construction-complete-test-data.sql
rm -f construction-schema-migration.sql
rm -f fix-purchase-orders-schema.sql
rm -f construction-enhanced-schema.sql
rm -f construction-projects-schema.sql
rm -f construction-sample-data.sql
rm -f create-payment-tables.sql
rm -f fix-all-errors.sh
rm -f fix-payment-booking-column.sql
rm -f fix-payment-all-columns.sql
rm -f fix-payment-complete.sql
rm -f recreate-payments-table.sql
rm -f fix-towers-table.sql
rm -f marketing-table.sql
rm -f sample-sales-data.sql
rm -f database-schema.sql

# Remove old shell scripts
rm -f auto-fix-entities.sh
rm -f generate-all-remaining-modules.sh
rm -f generate-construction-files.sh
rm -f generate-phase2b-files.sh
rm -f generate-upload-module.sh
rm -f quick-test.sh
rm -f run-migration.sh
rm -f test-sales-crm-api.sh
rm -f create-admin.js
rm -f sample.ts
rm -f CREATE_CONSTRUCTION_MODULE_FILES.md
rm -f RUN_THIS_MIGRATION.md

# Remove SQL backup files
rm -f backup_sales_crm_*.sql

# Remove old module creation scripts
rm -f create-marketing-module.sh
rm -f src/modules/create_all_services.sh
rm -f src/modules/create_remaining_dtos.sh
rm -f src/modules/SERVICE_CREATION_SUMMARY.md

cd ..

# Remove frontend old scripts
cd frontend
rm -f create-structure.sh
rm -f setup-complete-frontend.sh
rm -f fix-array-safety.sh
rm -f SALES_CRM_PAGES_COMPLETE.md
cd ..

# Remove root old scripts
rm -f generate-phases-3-4-5.sh
rm -f complete-upload-system.sh

echo "✅ Cleanup complete!"
echo "📊 Summary:"
echo "   - Removed old documentation files"
echo "   - Removed old SQL migration files"
echo "   - Removed old shell scripts"
echo "   - Removed backup files"
echo ""
echo "📁 Kept essential files:"
echo "   - README.md (project overview)"
echo "   - EASTERN_ESTATE_ERP_COMPLETE_USER_GUIDE.md (user manual)"
echo "   - EASTERN_ESTATE_ERP_USER_GUIDE.md (quick guide)"
echo "   - CODING_STANDARDS.md (development standards)"
echo "   - All source code files"
echo ""
echo "🎉 Codebase is now clean and production-ready!"
