# Google OAuth Setup Guide

## Overview
This system now supports Google SSO (Single Sign-On) with domain restriction to `@eecd.in` emails. Only pre-registered users can log in.

## Prerequisites

### 1. Google Cloud Console Setup

1. **Create a Google Cloud Project** (or use existing):
   - Go to https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google+ API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

3. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Select "Internal" (for Google Workspace users only)
   - Fill in:
     - App name: "Eastern Estate ERP"
     - User support email: info@eecd.in
     - Developer contact: info@eecd.in
   - Click "Save and Continue"
   - Scopes: Add `userinfo.email` and `userinfo.profile`
   - Click "Save and Continue"

4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "Eastern Estate ERP"
   - Authorized JavaScript origins:
     - http://localhost:3000 (development)
     - https://yourdomain.com (production)
   - Authorized redirect URIs:
     - http://localhost:3001/api/v1/auth/google/callback (development)
     - https://api.yourdomain.com/api/v1/auth/google/callback (production)
   - Click "Create"
   - **Copy the Client ID and Client Secret**

## Backend Environment Configuration

Add these environment variables to `backend/.env`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback

# Frontend URL (for redirect after OAuth)
FRONTEND_URL=http://localhost:3000
```

### Production Values

For production, update these to:

```env
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/v1/auth/google/callback
FRONTEND_URL=https://yourdomain.com
```

## Frontend Environment Configuration

Add to `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## Database Setup

Run the user seed to create the initial admin accounts:

```bash
cd backend
npm run seed:users
```

This will create:
- `info@eecd.in` - Super Admin (full access)
- `hr@eecd.in` - Admin (can manage users and most features)

## How It Works

### Authentication Flow

1. **User clicks "Sign in with Google" button**
2. **Redirect to Google OAuth** → User selects their @eecd.in account
3. **Google validates and returns user info**
4. **Backend validates**:
   - ✅ Email domain is `@eecd.in`
   - ✅ User exists in database (pre-registered by HR)
   - ✅ User account is active
5. **If all checks pass**: Generate JWT tokens and redirect to frontend
6. **If any check fails**: Show appropriate error message

### Domain Restriction

Only emails ending with `@eecd.in` can authenticate. This is enforced at the backend level in `GoogleStrategy`.

### Pre-Registration Requirement

Users MUST be added to the database before they can log in. This is done by:
- HR/Admin creating user accounts via the Users module
- Running database seeds for system accounts
- Direct database inserts (not recommended)

## Adding New Users

### Option 1: Via Admin Panel (Recommended)

1. Login as `hr@eecd.in` or `info@eecd.in`
2. Navigate to Users module
3. Click "Add User"
4. Fill in:
   - Email: `newuser@eecd.in` (must match their Google Workspace email)
   - Username: any unique username
   - First Name & Last Name
   - Assign Roles
   - Set as Active
5. Save

The user can now login with their Google account.

### Option 2: Via Database Seed

Edit `backend/src/database/seeds/users.seed.ts` and add to the users array:

```typescript
{
  email: 'newuser@eecd.in',
  username: 'newuser',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+91-1234567890',
  role: 'sales_executive', // or any role
},
```

Then run: `npm run seed:users`

## API Endpoints

### Initiate Google Login
```
GET /api/v1/auth/google
```
Redirects user to Google OAuth consent screen.

### Google Callback (handled automatically)
```
GET /api/v1/auth/google/callback
```
Receives OAuth response from Google, validates, and redirects to frontend with tokens.

### Frontend Routes

#### Success Callback
```
/auth/google/callback?token=<jwt>&refreshToken=<refresh-jwt>
```
Frontend receives tokens and stores them.

#### Error Callback
```
/auth/error?message=<error-message>
```
Shown when:
- User not found in database (not pre-registered)
- Account is deactivated
- Domain is not @eecd.in

## Security Features

1. **Domain Whitelisting**: Only @eecd.in emails allowed
2. **Pre-Registration Required**: Users must be in database before login
3. **Account Status Check**: Inactive accounts cannot login
4. **Session Management**: JWT-based with refresh tokens
5. **Automatic Profile Updates**: Name and photo synced from Google
6. **Last Login Tracking**: Records when user last authenticated

## Testing

### Development Testing

1. Start backend: `cd backend && npm run start:dev`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to login page
4. Click "Sign in with Google"
5. Select your @eecd.in account
6. Should redirect back with authentication

### Test Accounts

Default seeded accounts:
- `info@eecd.in` - Super Admin
- `hr@eecd.in` - Admin

Password authentication is still supported for these accounts with password: `Password@123`

## Troubleshooting

### "You do not have access yet"
- User not found in database
- Solution: Have HR add the user account first

### "Only @eecd.in domain emails are allowed"
- Trying to login with non-@eecd.in email
- Solution: Use Google Workspace @eecd.in email

### "Your account has been deactivated"
- User account is set to inactive
- Solution: Have admin reactivate the account

### "Invalid credentials" or OAuth errors
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in backend/.env
- Verify callback URL matches in Google Cloud Console
- Ensure Google+ API is enabled

### Redirect URI mismatch
- Check that `GOOGLE_CALLBACK_URL` in .env matches the redirect URI configured in Google Cloud Console
- Format: `http://localhost:3001/api/v1/auth/google/callback` (development)

## Migration Notes

### For Existing Users

Existing users with @easternestates.com emails will continue to work with password authentication. To migrate them to Google OAuth:

1. Create new accounts with @eecd.in emails in Google Workspace
2. Have HR create matching user records in the ERP
3. Users can then login with Google

### Backward Compatibility

The system still supports:
- Traditional email/password login
- All existing @easternestates.com accounts
- Refresh token mechanism
- All existing JWT-based authentication

Google OAuth is an additional authentication method, not a replacement.

## Production Deployment

1. Update environment variables in backend/.env:
```env
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/v1/auth/google/callback
FRONTEND_URL=https://yourdomain.com
```

2. Update Google Cloud Console redirect URIs:
   - Add production URLs
   - Update authorized origins

3. Ensure SSL/TLS certificates are configured

4. Test authentication flow before going live

## Support

For issues or questions:
- Contact: hr@eecd.in
- System Admin: info@eecd.in
