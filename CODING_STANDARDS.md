# Eastern Estate ERP - Coding Standards

## 📋 Overview

This document defines coding standards for the Eastern Estate ERP project to ensure consistency, maintainability, and reliability across the codebase.

---

## 🎯 Core Principles

1. **Comments:** Every function, class, and complex logic must be documented
2. **Indentation:** Use 4 spaces (not tabs)
3. **Error Handling:** Every operation must have proper error handling and fallbacks
4. **Type Safety:** Use TypeScript strictly, no `any` types
5. **Consistency:** Follow established patterns throughout the codebase

---

## 📝 Commenting Standards

### File Headers

Every file should start with a header comment:

```typescript
/**
 * @file employees.service.ts
 * @description Employee management service with CRUD operations
 * @module EmployeesModule
 * @author Eastern Estate Team
 * @created 2025-01-15
 */
```

### Class Comments

```typescript
/**
 * EmployeesService
 * 
 * Handles all employee-related business logic including:
 * - Creating and updating employee records
 * - Managing employee leave and attendance
 * - Calculating salary and payroll
 * 
 * @class
 * @implements Injectable
 */
@Injectable()
export class EmployeesService {
    // Implementation
}
```

### Method Comments

```typescript
/**
 * Creates a new employee record in the database
 * 
 * @param {CreateEmployeeDto} createEmployeeDto - Employee data to create
 * @returns {Promise<Employee>} The created employee object
 * @throws {BadRequestException} If validation fails
 * @throws {ConflictException} If employee code already exists
 * 
 * @example
 * const employee = await service.create({
 *     employeeCode: 'EMP001',
 *     firstName: 'John',
 *     lastName: 'Doe'
 * });
 */
async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    try {
        // Check for existing employee code
        const existing = await this.employeesRepository.findOne({
            where: { employeeCode: createEmployeeDto.employeeCode }
        });
        
        if (existing) {
            throw new ConflictException('Employee code already exists');
        }
        
        // Create and save new employee
        const employee = this.employeesRepository.create(createEmployeeDto);
        return await this.employeesRepository.save(employee);
        
    } catch (error) {
        // Log error for debugging
        console.error('Error creating employee:', error);
        
        // Re-throw known exceptions
        if (error instanceof ConflictException) {
            throw error;
        }
        
        // Throw generic error for unknown issues
        throw new BadRequestException('Failed to create employee');
    }
}
```

### Inline Comments

```typescript
// Calculate gross salary by adding all components
const grossSalary = 
    employee.basicSalary +        // Base salary
    employee.hraAllowance +       // House Rent Allowance
    employee.transportAllowance + // Travel allowance
    employee.medicalAllowance;    // Medical benefits

// Apply tax deductions if salary exceeds threshold
const taxableAmount = grossSalary > 250000 
    ? grossSalary * 0.1  // 10% tax for income above 2.5L
    : 0;                  // No tax below threshold
```

---

## 🔧 Indentation Standards

### Use 4 Spaces (Not Tabs)

**❌ Wrong:**
```typescript
export class Example {
  constructor() {
    this.value = 0;
  }
}
```

**✅ Correct:**
```typescript
export class Example {
    constructor() {
        this.value = 0;
    }
}
```

### Nested Structures

```typescript
export class Service {
    async complexOperation() {
        try {
            if (condition) {
                for (const item of items) {
                    if (item.isValid) {
                        await this.process(item);
                    }
                }
            }
        } catch (error) {
            this.handleError(error);
        }
    }
}
```

### Object Literals

```typescript
const config = {
    database: {
        host: 'localhost',
        port: 5432,
        credentials: {
            username: 'admin',
            password: 'secret'
        }
    },
    cache: {
        enabled: true,
        ttl: 3600
    }
};
```

---

## 🛡️ Error Handling Standards

### 1. Try-Catch Blocks

**Every async operation must be wrapped in try-catch:**

```typescript
async findOne(id: string): Promise<Employee> {
    try {
        // Attempt to find employee
        const employee = await this.employeesRepository.findOne({
            where: { id }
        });
        
        // Handle not found case
        if (!employee) {
            throw new NotFoundException(`Employee with ID ${id} not found`);
        }
        
        return employee;
        
    } catch (error) {
        // Log for debugging
        console.error(`Error fetching employee ${id}:`, error);
        
        // Re-throw known errors
        if (error instanceof NotFoundException) {
            throw error;
        }
        
        // Fallback error
        throw new InternalServerErrorException('Failed to fetch employee');
    }
}
```

### 2. Frontend Error Handling

```typescript
const fetchEmployees = async () => {
    try {
        // Set loading state
        setLoading(true);
        setError('');
        
        // Fetch data
        const response = await employeeService.getEmployees(filters);
        setEmployees(response.data);
        setMeta(response.meta);
        
    } catch (err: any) {
        // Extract error message
        const message = err.response?.data?.message || 
                       err.message || 
                       'Failed to fetch employees';
        
        // Set error state
        setError(message);
        
        // Log for debugging
        console.error('Error fetching employees:', err);
        
        // Fallback: Set empty data
        setEmployees([]);
        
    } finally {
        // Always reset loading state
        setLoading(false);
    }
};
```

### 3. Service Layer Error Handling

```typescript
export const employeeService = {
    /**
     * Fetches all employees with filters
     * @param filters - Query filters
     * @returns Promise with employees data
     */
    async getEmployees(filters: EmployeeFilters = {}): Promise<PaginatedEmployeeResponse> {
        try {
            const response = await axios.get(`${API_URL}/employees`, { 
                params: filters 
            });
            return response.data;
            
        } catch (error: any) {
            // Log error details
            console.error('Employee service error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            
            // Throw with better error message
            throw new Error(
                error.response?.data?.message || 
                'Failed to fetch employees. Please try again.'
            );
        }
    }
};
```

### 4. Validation Error Handling

```typescript
@Post()
async create(@Body() createDto: CreateEmployeeDto) {
    try {
        // Validate DTO (automatically done by class-validator)
        // Additional business validation
        if (createDto.salary < 0) {
            throw new BadRequestException('Salary cannot be negative');
        }
        
        // Process creation
        return await this.service.create(createDto);
        
    } catch (error) {
        // Handle validation errors
        if (error instanceof BadRequestException) {
            throw error;
        }
        
        // Handle database errors
        if (error.code === '23505') { // Unique constraint
            throw new ConflictException('Employee already exists');
        }
        
        // Fallback error
        throw new InternalServerErrorException('Failed to create employee');
    }
}
```

### 5. Database Operation Fallbacks

```typescript
async findAll(query: QueryDto): Promise<PaginatedResponse> {
    try {
        // Primary query
        const [data, total] = await this.repository.findAndCount({
            skip: (query.page - 1) * query.limit,
            take: query.limit
        });
        
        return {
            data,
            meta: {
                total,
                page: query.page,
                limit: query.limit,
                totalPages: Math.ceil(total / query.limit)
            }
        };
        
    } catch (error) {
        console.error('Database query failed:', error);
        
        // Fallback: Return empty result
        return {
            data: [],
            meta: {
                total: 0,
                page: query.page || 1,
                limit: query.limit || 10,
                totalPages: 0
            }
        };
    }
}
```

---

## 🎨 Code Formatting Standards

### .prettierrc Configuration

```json
{
    "tabWidth": 4,
    "useTabs": false,
    "semi": true,
    "singleQuote": true,
    "trailingComma": "es5",
    "printWidth": 100,
    "arrowParens": "always"
}
```

### ESLint Configuration

```json
{
    "rules": {
        "indent": ["error", 4],
        "no-tabs": "error",
        "quotes": ["error", "single"],
        "semi": ["error", "always"],
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/explicit-function-return-type": "warn"
    }
}
```

---

## 🔄 Refactoring Checklist

When refactoring existing code:

- [ ] Add file header comment
- [ ] Add class/interface documentation
- [ ] Add method documentation with JSDoc
- [ ] Add inline comments for complex logic
- [ ] Convert indentation to 4 spaces
- [ ] Wrap all async operations in try-catch
- [ ] Add fallback error handling
- [ ] Add error logging
- [ ] Test error scenarios
- [ ] Update tests if needed

---

## 📦 Example: Fully Compliant Service

```typescript
/**
 * @file employees.service.ts
 * @description Service for managing employee data and operations
 * @module EmployeesModule
 * @author Eastern Estate Team
 */

import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto, UpdateEmployeeDto, QueryEmployeeDto } from './dto';

/**
 * EmployeesService
 * 
 * Handles all employee-related business logic including CRUD operations,
 * leave management, attendance tracking, and payroll calculations.
 * 
 * @class
 * @implements Injectable
 */
@Injectable()
export class EmployeesService {
    /**
     * Creates an instance of EmployeesService
     * @param {Repository<Employee>} employeesRepository - TypeORM repository for Employee entity
     */
    constructor(
        @InjectRepository(Employee)
        private readonly employeesRepository: Repository<Employee>
    ) {}

    /**
     * Creates a new employee record
     * 
     * Validates employee code uniqueness and creates a new employee record
     * with all provided information.
     * 
     * @param {CreateEmployeeDto} createEmployeeDto - Employee data to create
     * @returns {Promise<Employee>} The newly created employee
     * @throws {ConflictException} If employee code already exists
     * @throws {BadRequestException} If creation fails
     * 
     * @example
     * const employee = await service.create({
     *     employeeCode: 'EMP001',
     *     firstName: 'John',
     *     lastName: 'Doe',
     *     department: 'Sales'
     * });
     */
    async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
        try {
            // Check for existing employee with same code
            const existing = await this.employeesRepository.findOne({
                where: { employeeCode: createEmployeeDto.employeeCode }
            });
            
            // Throw error if employee code already exists
            if (existing) {
                throw new ConflictException(
                    `Employee with code ${createEmployeeDto.employeeCode} already exists`
                );
            }
            
            // Create new employee entity
            const employee = this.employeesRepository.create(createEmployeeDto);
            
            // Save to database
            const saved = await this.employeesRepository.save(employee);
            
            // Log success
            console.log(`Successfully created employee: ${saved.employeeCode}`);
            
            return saved;
            
        } catch (error) {
            // Log error details for debugging
            console.error('Error creating employee:', {
                error: error.message,
                stack: error.stack,
                dto: createEmployeeDto
            });
            
            // Re-throw known exceptions
            if (error instanceof ConflictException) {
                throw error;
            }
            
            // Handle database errors
            if (error.code === '23505') {
                throw new ConflictException('Employee code must be unique');
            }
            
            // Fallback error for unknown issues
            throw new BadRequestException(
                'Failed to create employee. Please check your data and try again.'
            );
        }
    }

    /**
     * Retrieves all employees with optional filtering and pagination
     * 
     * @param {QueryEmployeeDto} query - Query parameters for filtering and pagination
     * @returns {Promise<PaginatedEmployeeResponse>} Paginated list of employees
     * @throws {BadRequestException} If query fails
     * 
     * @example
     * const result = await service.findAll({ 
     *     department: 'Sales', 
     *     page: 1, 
     *     limit: 10 
     * });
     */
    async findAll(query: QueryEmployeeDto): Promise<any> {
        try {
            const { 
                search, 
                department, 
                status, 
                page = 1, 
                limit = 10 
            } = query;

            // Build query with filters
            const queryBuilder = this.employeesRepository.createQueryBuilder('employee');

            // Add search filter if provided
            if (search) {
                queryBuilder.where(
                    '(employee.firstName LIKE :search OR employee.lastName LIKE :search OR employee.employeeCode LIKE :search)',
                    { search: `%${search}%` }
                );
            }

            // Add department filter if provided
            if (department) {
                queryBuilder.andWhere('employee.department = :department', { department });
            }

            // Add status filter if provided
            if (status) {
                queryBuilder.andWhere('employee.status = :status', { status });
            }

            // Add pagination
            queryBuilder
                .skip((page - 1) * limit)
                .take(limit)
                .orderBy('employee.createdAt', 'DESC');

            // Execute query
            const [data, total] = await queryBuilder.getManyAndCount();

            // Return paginated response
            return {
                data,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            // Log error
            console.error('Error fetching employees:', error);

            // Fallback: Return empty result
            return {
                data: [],
                meta: {
                    total: 0,
                    page: query.page || 1,
                    limit: query.limit || 10,
                    totalPages: 0
                }
            };
        }
    }

    /**
     * Retrieves a single employee by ID
     * 
     * @param {string} id - Employee UUID
     * @returns {Promise<Employee>} The found employee
     * @throws {NotFoundException} If employee not found
     * @throws {BadRequestException} If query fails
     * 
     * @example
     * const employee = await service.findOne('uuid-here');
     */
    async findOne(id: string): Promise<Employee> {
        try {
            // Attempt to find employee
            const employee = await this.employeesRepository.findOne({
                where: { id }
            });

            // Throw error if not found
            if (!employee) {
                throw new NotFoundException(`Employee with ID ${id} not found`);
            }

            return employee;

        } catch (error) {
            // Log error
            console.error(`Error fetching employee ${id}:`, error);

            // Re-throw known errors
            if (error instanceof NotFoundException) {
                throw error;
            }

            // Fallback error
            throw new BadRequestException('Failed to fetch employee');
        }
    }

    /**
     * Updates an existing employee
     * 
     * @param {string} id - Employee UUID
     * @param {UpdateEmployeeDto} updateEmployeeDto - Updated employee data
     * @returns {Promise<Employee>} The updated employee
     * @throws {NotFoundException} If employee not found
     * @throws {BadRequestException} If update fails
     * 
     * @example
     * const updated = await service.update('uuid', { 
     *     status: 'Active' 
     * });
     */
    async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
        try {
            // Find existing employee
            const employee = await this.findOne(id);

            // Apply updates
            Object.assign(employee, updateEmployeeDto);

            // Save changes
            const updated = await this.employeesRepository.save(employee);

            // Log success
            console.log(`Successfully updated employee: ${updated.employeeCode}`);

            return updated;

        } catch (error) {
            // Log error
            console.error(`Error updating employee ${id}:`, error);

            // Re-throw known errors
            if (error instanceof NotFoundException) {
                throw error;
            }

            // Fallback error
            throw new BadRequestException('Failed to update employee');
        }
    }

    /**
     * Soft deletes an employee by setting isActive to false
     * 
     * @param {string} id - Employee UUID
     * @returns {Promise<void>}
     * @throws {NotFoundException} If employee not found
     * @throws {BadRequestException} If deletion fails
     * 
     * @example
     * await service.remove('uuid-here');
     */
    async remove(id: string): Promise<void> {
        try {
            // Find existing employee
            const employee = await this.findOne(id);

            // Soft delete by setting inactive
            employee.isActive = false;

            // Save changes
            await this.employeesRepository.save(employee);

            // Log success
            console.log(`Successfully deleted employee: ${employee.employeeCode}`);

        } catch (error) {
            // Log error
            console.error(`Error deleting employee ${id}:`, error);

            // Re-throw known errors
            if (error instanceof NotFoundException) {
                throw error;
            }

            // Fallback error
            throw new BadRequestException('Failed to delete employee');
        }
    }
}
```

---

## 🚀 Migration Guide

### Step 1: Setup Formatters

```bash
# Install Prettier
npm install --save-dev prettier

# Install ESLint
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### Step 2: Configure Prettier

Create `.prettierrc`:
```json
{
    "tabWidth": 4,
    "useTabs": false,
    "semi": true,
    "singleQuote": true
}
```

### Step 3: Format Code

```bash
# Format all files
npx prettier --write "src/**/*.{ts,tsx}"

# Fix ESLint issues
npx eslint --fix "src/**/*.{ts,tsx}"
```

### Step 4: Add Pre-commit Hook

```bash
npm install --save-dev husky lint-staged

# Configure in package.json
"lint-staged": {
    "*.{ts,tsx}": [
        "prettier --write",
        "eslint --fix"
    ]
}
```

---

## ✅ Code Review Checklist

Before submitting code:

- [ ] All files have proper header comments
- [ ] All classes are documented
- [ ] All public methods have JSDoc comments
- [ ] Complex logic has inline comments
- [ ] Code uses 4-space indentation
- [ ] All async operations have try-catch blocks
- [ ] All errors have appropriate fallbacks
- [ ] Error messages are user-friendly
- [ ] Errors are logged for debugging
- [ ] No `any` types used
- [ ] Tests are updated/added
- [ ] Code passes ESLint
- [ ] Code passes Prettier format check

---

## 📚 Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [NestJS Best Practices](https://docs.nestjs.com/techniques/validation)
- [React Best Practices](https://react.dev/learn)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)

---

## 🤝 Contributing

When adding new code:

1. Follow all standards in this document
2. Add comprehensive comments
3. Handle all error cases
4. Test error scenarios
5. Update documentation
6. Request code review

---

**Remember:** Well-commented, properly formatted, and error-resistant code is maintainable code!
