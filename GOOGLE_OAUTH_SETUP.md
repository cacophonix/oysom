# Google OAuth Authentication Setup Guide

This guide explains how to set up Google OAuth authentication for your Medusa store.

## Overview

The Google OAuth integration allows users to sign in or sign up using their Google account, providing a seamless authentication experience.

## Architecture

### Backend (Medusa)
- **Auth Module**: `@medusajs/auth-google@2.10.3`
- **API Routes**:
  - `/auth/google` - Initiates OAuth flow
  - `/auth/google/callback` - Handles OAuth callback from Google

### Frontend (Next.js Storefront)
- **Helper Functions**: `src/lib/data/google-auth.ts`
- **UI Components**: Google sign-in buttons in login and register pages
- **Status Handling**: Success/error messages after OAuth completion

## Setup Instructions

### 1. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Configure:
     - **Name**: Your application name
     - **Authorized JavaScript origins**: 
       - `http://localhost:9000` (development)
       - Your production backend URL
     - **Authorized redirect URIs**:
       - `http://localhost:9000/auth/google/callback` (development)
       - `https://your-backend-domain.com/auth/google/callback` (production)
   - Click "Create"
   - Copy the **Client ID** and **Client Secret**

### 2. Backend Environment Configuration

Add the following environment variables to your `.env` file in the `oysom` directory:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:9000/auth/google/callback
MEDUSA_BACKEND_URL=http://localhost:9000
```

For production, update these values accordingly.

### 3. Update CORS Settings

Ensure your `STORE_CORS` environment variable includes your storefront URL:

```bash
STORE_CORS=http://localhost:8000,http://localhost:3001
```

### 4. Database Migration

After configuration, restart your Medusa backend to apply the auth module changes:

```bash
cd oysom
npm run dev
```

The auth module will automatically set up the necessary database tables.

## How It Works

### User Flow

1. **Initiation**: User clicks "Continue with Google" button
2. **Redirect**: User is redirected to `/auth/google` endpoint
3. **Google OAuth**: Backend redirects to Google's OAuth consent screen
4. **Consent**: User grants permissions
5. **Callback**: Google redirects back to `/auth/google/callback`
6. **Authentication**: Backend validates the OAuth response
7. **Session**: Backend creates a session and sets cookies
8. **Redirect**: User is redirected back to storefront with auth status
9. **Success**: Storefront displays success message and user is logged in

### API Endpoints

#### `GET /auth/google`
Initiates the Google OAuth flow.

**Response**: Redirects to Google OAuth consent screen

#### `GET /auth/google/callback`
Handles the OAuth callback from Google.

**Query Parameters**:
- `code`: Authorization code from Google
- `state`: State parameter for CSRF protection

**Response**: Redirects to storefront with auth status
- Success: `http://localhost:8000/account?auth=success`
- Error: `http://localhost:8000/account?auth=error&message=<error_message>`

### Frontend Integration

#### Helper Functions

**`initiateGoogleAuth()`**
Redirects user to the backend OAuth endpoint to start the flow.

```typescript
import { initiateGoogleAuth } from "@lib/data/google-auth"

// In your component
const handleGoogleLogin = () => {
  initiateGoogleAuth()
}
```

**`checkAuthStatus()`**
Checks URL parameters for OAuth completion status.

```typescript
import { checkAuthStatus } from "@lib/data/google-auth"

// In useEffect
const status = checkAuthStatus()
if (status.success) {
  // Show success message
} else if (status.error) {
  // Show error message
}
```

## Security Considerations

1. **Environment Variables**: Never commit your Google Client Secret to version control
2. **HTTPS in Production**: Always use HTTPS for production OAuth flows
3. **CORS Configuration**: Properly configure CORS to only allow your frontend domains
4. **Callback URL Validation**: Google validates redirect URIs against configured authorized URIs
5. **State Parameter**: The auth module handles CSRF protection via state parameter

## Troubleshooting

### "redirect_uri_mismatch" Error
- Ensure the callback URL in Google Cloud Console exactly matches your configuration
- Check for trailing slashes - they matter!
- Verify the protocol (http vs https) matches

### User Redirected Back But Not Logged In
- Check backend logs for authentication errors
- Verify Google OAuth credentials are correct
- Ensure CORS is properly configured
- Check that cookies are being set correctly

### "Authentication failed" Error
- Verify the Google Client ID and Secret are correct
- Check that the Google+ API is enabled in Google Cloud Console
- Ensure your app is not in testing mode with limited users (or add your email to test users)

### Environment Variables Not Loading
- Restart the Medusa backend after changing `.env` file
- Verify the `.env` file is in the correct directory (`oysom/`)
- Check for typos in environment variable names

## Testing

### Local Testing
1. Start your Medusa backend: `cd oysom && npm run dev`
2. Start your storefront: `cd oysom-storefront && npm run dev`
3. Navigate to `http://localhost:8000/account` (or your storefront URL)
4. Click "Continue with Google"
5. Complete the Google OAuth flow
6. Verify you're logged in

### Production Testing
1. Deploy your backend and storefront
2. Update Google Cloud Console OAuth settings with production URLs
3. Update environment variables with production values
4. Test the complete flow in production

## Monitoring

Monitor the following for issues:
- Backend logs for OAuth errors
- Google Cloud Console OAuth metrics
- Failed authentication attempts
- Session creation success rate

## Additional Resources

- [Medusa Auth Documentation](https://docs.medusajs.com/resources/commerce-modules/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

## Support

If you encounter issues not covered in this guide:
1. Check Medusa Discord for community support
2. Review GitHub issues in the Medusa repository
3. Consult the Medusa documentation