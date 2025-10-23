# Notifications System Guide

## Overview

A comprehensive in-app notifications system has been built for the Eastern Estate ERP. This system allows sending notifications to users based on their roles and departments, with optional email integration.

## Features

### 🎯 Core Features

1. **Role-Based Notifications**: Send notifications to all users with specific roles (e.g., "Sales Manager", "Admin")
2. **Department-Based Notifications**: Target users in specific departments (e.g., "SALES", "CONSTRUCTION")
3. **Individual Notifications**: Send notifications to specific users
4. **Email Integration**: Optional email notifications alongside in-app notifications
5. **Rich Notification Types**: INFO, SUCCESS, WARNING, ERROR, ALERT
6. **Categories**: BOOKING, PAYMENT, LEAD, CONSTRUCTION, EMPLOYEE, CUSTOMER, ACCOUNTING, SYSTEM, TASK, REMINDER
7. **Action Links**: Include actionable links in notifications
8. **Priority System**: Prioritize important notifications
9. **Expiry System**: Auto-expire notifications after a certain date
10. **Mark as Read/Unread**: Track notification read status
11. **Bulk Operations**: Mark all as read, clear read notifications

## Architecture

### Backend Structure

```
backend/src/modules/notifications/
├── entities/
│   └── notification.entity.ts         # Notification entity with all fields
├── dto/
│   └── create-notification.dto.ts     # DTO for creating notifications
├── notifications.service.ts            # Business logic for notifications
├── notifications.controller.ts         # REST API endpoints
├── notifications.module.ts             # Module configuration
├── email.service.ts                    # Email service (already existed)
└── reminder.service.ts                 # Reminder service (already existed)
```

### Frontend Structure

```
frontend/src/
├── services/
│   └── notifications.service.ts        # API client for notifications
├── app/(dashboard)/
│   └── notifications/
│       └── page.tsx                    # Notifications page UI
└── components/layout/
    └── Sidebar.tsx                     # Updated with notifications link
```

## Database Schema

The notifications table has been created with the following key fields:

- **user_id**: Target user (nullable for role/department-based)
- **target_roles**: Comma-separated role names
- **target_departments**: Comma-separated department names
- **title**: Notification title (max 500 chars)
- **message**: Notification message
- **type**: INFO | SUCCESS | WARNING | ERROR | ALERT
- **category**: BOOKING | PAYMENT | LEAD | etc.
- **action_url**: Optional link for the notification
- **action_label**: Label for the action button
- **is_read**: Read status
- **should_send_email**: Whether to send email
- **priority**: Notification priority (higher = more important)
- **expires_at**: Optional expiration date
- **metadata**: Additional JSON data

## API Endpoints

### GET /notifications
Get all notifications for the current user
- Query param: `includeRead` (true/false)

### GET /notifications/unread-count
Get count of unread notifications

### POST /notifications
Create a new notification
```json
{
  "userId": "uuid",              // Optional: specific user
  "targetRoles": "Admin,Manager", // Optional: comma-separated roles
  "targetDepartments": "SALES",   // Optional: comma-separated departments
  "title": "New Booking Created",
  "message": "A new booking has been created for Tower A, Flat 101",
  "type": "SUCCESS",
  "category": "BOOKING",
  "actionUrl": "/bookings/123",
  "actionLabel": "View Booking",
  "shouldSendEmail": false,
  "priority": 5
}
```

### PATCH /notifications/:id/read
Mark a notification as read

### PATCH /notifications/mark-all-read
Mark all notifications as read

### DELETE /notifications/:id
Delete a notification

### DELETE /notifications/clear/read
Clear all read notifications

## Usage Examples

### 1. Send Notification to Specific User

```typescript
import notificationsService from '@/services/notifications.service';

await notificationsService.create({
  userId: "user-uuid-here",
  title: "Payment Received",
  message: "Payment of ₹50,000 has been received for Booking #B123",
  type: "SUCCESS",
  category: "PAYMENT",
  actionUrl: "/payments/payment-id",
  actionLabel: "View Payment",
  shouldSendEmail: true
});
```

### 2. Send Notification to All Sales Managers

```typescript
await notificationsService.create({
  targetRoles: "Sales Manager,Sales Team Lead",
  title: "New Lead Assigned",
  message: "A high-priority lead has been assigned to your team",
  type: "INFO",
  category: "LEAD",
  actionUrl: "/leads/lead-id",
  actionLabel: "View Lead",
  priority: 8
});
```

### 3. Send Notification to Construction Department

```typescript
await notificationsService.create({
  targetDepartments: "CONSTRUCTION",
  title: "Material Delivery Alert",
  message: "Cement delivery scheduled for tomorrow at Tower B",
  type: "ALERT",
  category: "CONSTRUCTION",
  actionUrl: "/construction/materials",
  priority: 7
});
```

### 4. Backend Service Usage

```typescript
import { NotificationsService } from './notifications/notifications.service';

@Injectable()
export class BookingsService {
  constructor(
    private notificationsService: NotificationsService
  ) {}

  async createBooking(data: CreateBookingDto) {
    const booking = await this.bookingRepository.save(data);
    
    // Send notification to admins
    await this.notificationsService.create({
      targetRoles: 'Admin,Manager',
      title: 'New Booking Created',
      message: `New booking ${booking.bookingNumber} created for ${booking.customerName}`,
      type: 'SUCCESS',
      category: 'BOOKING',
      actionUrl: `/bookings/${booking.id}`,
      actionLabel: 'View Booking',
      shouldSendEmail: true,
      priority: 5
    });
    
    return booking;
  }
}
```

## Setup Instructions

### 1. Run Database Migration

```bash
cd backend
psql -U your_username -d eastern_estate_erp -f create-notifications-table.sql
```

### 2. Verify Backend Module

The NotificationsModule is already configured in the backend. Ensure it's imported in `app.module.ts`:

```typescript
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    // ... other modules
    NotificationsModule,
  ],
})
export class AppModule {}
```

### 3. Access Notifications Page

Navigate to `/notifications` in your application to view all notifications.

## Role-Department Mapping

The system uses the following mapping for department-based notifications:

- **SALES**: Sales Manager, Sales Executive, Sales Team Lead
- **MARKETING**: Marketing Manager, Marketing Executive
- **OPERATIONS**: Operations Manager, Operations Executive
- **FINANCE**: Finance Manager, Accountant, Finance Executive
- **HR**: HR Manager, HR Executive
- **IT**: IT Manager, IT Executive, Developer
- **CONSTRUCTION**: Construction Manager, Construction Supervisor, Construction Executive
- **CUSTOMER_SERVICE**: Customer Service Manager, Customer Service Executive
- **MANAGEMENT**: CEO, Director, General Manager

You can customize this mapping in `backend/src/modules/notifications/notifications.service.ts`.

## Email Integration

The email functionality is ready to be integrated. To enable:

1. Configure email settings in your `.env` file:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Eastern Estate ERP <noreply@easternestae.com>
EMAIL_ADMIN=admin@easternestae.com
EMAIL_SECURE=false
```

2. Set `shouldSendEmail: true` when creating notifications

## UI Features

The notifications page includes:

- **Filter by Status**: View all or only unread notifications
- **Real-time Updates**: Notifications update in real-time
- **Mark as Read**: Click on individual notifications or use bulk action
- **Delete Notifications**: Remove unwanted notifications
- **Clear Read**: Bulk delete all read notifications
- **Action Links**: Click notifications to navigate to related pages
- **Visual Indicators**: Color-coded by type, icons for categories
- **Timestamp**: Shows how long ago the notification was created

## Best Practices

1. **Use Appropriate Categories**: Always set the correct category for filtering
2. **Set Priority**: Use priority 1-10 (10 being highest) for important notifications
3. **Include Action Links**: Make notifications actionable when possible
4. **Clear Messages**: Write concise, actionable notification messages
5. **Email Sparingly**: Only send emails for critical notifications
6. **Set Expiry**: Use expiry dates for time-sensitive notifications
7. **Use Metadata**: Store additional context in the metadata field

## Future Enhancements

Potential features to add:

1. Real-time WebSocket notifications
2. Push notifications for mobile
3. Notification preferences per user
4. Notification templates
5. Scheduled notifications
6. Notification analytics
7. Rich media in notifications (images, videos)
8. Notification groups/threads
9. Snooze functionality
10. Custom notification sounds

## Troubleshooting

### Notifications not appearing
- Check if the user has the correct role/department
- Verify the notification was created successfully in the database
- Check the expiry date (if set)

### Email not sending
- Verify email configuration in `.env`
- Check the email service logs
- Ensure `shouldSendEmail` is set to `true`

### Performance issues
- The system uses database indexes for optimal performance
- Consider implementing pagination for users with many notifications
- Use the cleanup function regularly to remove expired notifications

## Support

For issues or questions about the notifications system, contact the development team or refer to the main ERP documentation.
