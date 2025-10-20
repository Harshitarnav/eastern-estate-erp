# Event-Driven Booking System - Implementation Guide

## Overview

The Eastern Estate ERP now features a fully event-driven booking system that automatically orchestrates multiple operations when a new booking is created, including:

- ✅ Flat status updates (AVAILABLE → BOOKED)
- ✅ Token payment record creation  
- ✅ Payment schedule generation based on selected plan
- ✅ Property & tower inventory count updates
- ✅ Customer last booking date tracking
- ✅ Email notifications to customer and admin

## Architecture

### Transaction Safety

The system uses database transactions to ensure data consistency. If any critical operation fails, all changes are rolled back automatically.

### Graceful Degradation

Non-critical operations (like email sending) are handled asynchronously and won't block or rollback the booking creation if they fail. Failures are logged for monitoring.

## Setup Guide

### 1. Database Schema Updates

Run these SQL commands to add the new fields:

```sql
-- Add payment_plan and tower_id to bookings table
ALTER TABLE bookings 
ADD COLUMN payment_plan VARCHAR(50),
ADD COLUMN tower_id UUID;

-- Add last_booking_date to customers table
ALTER TABLE customers 
ADD COLUMN last_booking_date DATE;

-- Create payment_schedules table
CREATE TABLE payment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    schedule_number VARCHAR(50) NOT NULL,
    installment_number INT NOT NULL,
    total_installments INT NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    milestone VARCHAR(100),
    status VARCHAR(20) DEFAULT 'PENDING',
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    paid_date DATE,
    payment_id UUID,
    is_overdue BOOLEAN DEFAULT false,
    overdue_days INT DEFAULT 0,
    penalty_amount DECIMAL(15, 2) DEFAULT 0,
    is_waived BOOLEAN DEFAULT false,
    waiver_reason TEXT,
    waived_date DATE,
    waived_by UUID,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE INDEX idx_payment_schedules_booking ON payment_schedules(booking_id);
CREATE INDEX idx_payment_schedules_due_date ON payment_schedules(due_date);
CREATE INDEX idx_payment_schedules_status ON payment_schedules(status);
```

### 2. Email Configuration

#### Using Gmail

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password

3. Add to your `.env` file:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM=Eastern Estate <noreply@easternestates.com>
ADMIN_EMAIL=admin@easternestates.com
```

#### Using SendGrid

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=Eastern Estate <noreply@easternestates.com>
ADMIN_EMAIL=admin@easternestates.com
```

#### Using AWS SES

```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-aws-smtp-username
EMAIL_PASSWORD=your-aws-smtp-password
EMAIL_FROM=Eastern Estate <noreply@easternestates.com>
ADMIN_EMAIL=admin@easternestates.com
```

### 3. Restart Backend Server

```bash
cd backend
npm run start:dev
```

## How It Works

### Booking Creation Workflow

When a new booking is created:

```
1. VALIDATION
   ├── Check booking number uniqueness
   ├── Verify flat exists and is AVAILABLE
   ├── Verify property exists
   └── Verify customer exists

2. TRANSACTION START

3. CREATE BOOKING RECORD
   ├── Calculate balance amount
   ├── Set status to TOKEN_PAID
   └── Save booking

4. UPDATE FLAT STATUS
   ├── Change status to BOOKED
   ├── Mark as unavailable
   ├── Link to customer
   └── Store booking details

5. CREATE TOKEN PAYMENT
   ├── Generate payment number
   ├── Record token amount
   ├── Set status to RECEIVED
   └── Link to booking

6. UPDATE INVENTORY COUNTS
   ├── Increment property unit count
   └── Increment tower unit count (if applicable)

7. UPDATE CUSTOMER
   └── Set last booking date

8. COMMIT TRANSACTION

9. POST-TRANSACTION (Async)
   ├── Generate payment schedule
   ├── Send customer confirmation email
   └── Send admin notification email
```

### Payment Schedule Generation

Three payment plan types are supported:

#### 1. Construction Linked (7 Milestones)

| Milestone | Percentage | Typical Timeline |
|-----------|-----------|------------------|
| Agreement Signing | 10% | Immediate |
| Foundation Complete | 15% | +3 months |
| Plinth Level | 10% | +6 months |
| Structure Complete | 20% | +12 months |
| Brickwork Complete | 10% | +15 months |
| Finishing Work | 15% | +18 months |
| On Possession | 20% | +24 months |

#### 2. Time Linked (12 Monthly Installments)

- Equal monthly installments over 12 months
- First installment due one month after booking
- Remaining amount split equally

#### 3. Down Payment Plan

| Installment | Percentage | Timeline |
|-------------|-----------|----------|
| Down Payment | 20% | +30 days |
| On Possession | 80% | +24 months |

## Email Templates

### Customer Confirmation Email

Includes:
- Booking confirmation with booking number
- Property and flat details
- Financial summary (total, token paid, balance)
- Payment plan information
- Next steps and contact information

### Admin Notification Email

Includes:
- New booking alert
- Customer contact details
- Property/unit information
- Financial summary
- Action items (KYC verification, agreement scheduling, etc.)

## API Updates

### Create Booking Endpoint

**POST** `/api/v1/bookings`

New fields added:

```json
{
  "bookingNumber": "BK-2025-001",
  "customerId": "uuid",
  "propertyId": "uuid",
  "towerId": "uuid",         // NEW: Required
  "flatId": "uuid",
  "paymentPlan": "CONSTRUCTION_LINKED",  // NEW: Optional
  "bookingDate": "2025-01-20",
  "totalAmount": 5000000,
  "tokenAmount": 500000,
  "agreementAmount": 1000000,
  "tokenPaidDate": "2025-01-20",
  "tokenReceiptNumber": "TKN-001",
  "tokenPaymentMode": "UPI"
}
```

### Get Payment Schedule Endpoint

**GET** `/api/v1/bookings/:bookingId/schedule`

Returns array of payment schedules with due dates and amounts.

## Frontend Updates

### Booking Form Enhancements

The booking form now includes:

1. **Cascading Dropdowns**
   - Select Property → Shows Towers
   - Select Tower → Shows Available Flats
   - Flat dropdown shows unit details (type, price, area)

2. **Payment Plan Selector**
   - Construction Linked (milestone-based)
   - Time Linked (monthly installments)
   - Down Payment (20% + 80%)

3. **Improved UX**
   - Real-time flat availability check
   - Auto-populate pricing from selected flat
   - Disabled selectors until parent is chosen

## Testing

### Manual Testing Checklist

- [ ] Create booking with Construction Linked plan
- [ ] Verify flat status changed to BOOKED
- [ ] Check token payment record created
- [ ] Verify payment schedule generated (7 installments)
- [ ] Confirm property/tower counts updated
- [ ] Check customer confirmation email received
- [ ] Check admin notification email received
- [ ] Verify booking creation fails if flat not available
- [ ] Test transaction rollback on error

### Email Testing

Test emails without actual sending:

```bash
# Check backend logs for email content
tail -f backend/logs/application.log | grep "Email"
```

Or use a test email service like:
- [Mailtrap](https://mailtrap.io) - Email testing
- [Ethereal Email](https://ethereal.email) - Fake SMTP service

## Monitoring

### Logs to Watch

```bash
# Backend logs
cd backend
npm run start:dev

# Watch for:
# - "Creating booking: BK-XXXX"
# - "Flat status updated to BOOKED"
# - "Token payment record created"
# - "Payment schedule generated"
# - "Email sent successfully"
# - "Transaction committed"
```

### Common Issues

**Issue: Emails not sending**
- Check EMAIL_USER and EMAIL_PASSWORD are correct
- Verify SMTP settings for your provider
- Check if 2FA is enabled (Gmail requires App Password)
- Review backend logs for specific error messages

**Issue: Transaction rollback**
- Check all required IDs are valid
- Verify flat is AVAILABLE status
- Ensure database constraints are satisfied
- Review error message in API response

**Issue: Payment schedule not generated**
- Check booking was committed successfully
- Verify paymentPlan value is valid
- Review payment schedule service logs

## Performance Considerations

- Email sending is asynchronous (non-blocking)
- Payment schedule generation happens after transaction commit
- Database transaction ensures atomicity
- All operations complete within 2-3 seconds typically

## Future Enhancements

Potential improvements:

1. **Queue System**
   - Use Bull/Redis for email queue
   - Retry failed email sends automatically

2. **SMS Notifications**
   - Send SMS confirmation to customer
   - Alert admin via SMS for high-value bookings

3. **WhatsApp Integration**
   - Send booking confirmation on WhatsApp
   - Share payment schedule via WhatsApp

4. **Payment Reminders**
   - Automated email reminders before due dates
   - Escalation for overdue payments

5. **Booking Cancellation**
   - Reverse all changes (flat status, counts)
   - Handle refund processing
   - Notify stakeholders

## Support

For issues or questions:
- Check backend logs for detailed error messages
- Review this documentation
- Contact: support@easternestates.com

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅



