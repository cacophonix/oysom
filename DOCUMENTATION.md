# Ojsom E-Commerce Platform Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Backend (Medusa)](#backend-medusa)
4. [Storefront (Next.js)](#storefront-nextjs)
5. [Checkout Flow](#checkout-flow)
6. [Setup & Installation](#setup--installation)
7. [Environment Configuration](#environment-configuration)
8. [Development Workflow](#development-workflow)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Ojsom is a modern e-commerce platform built with:
- **Backend**: Medusa.js v2 (headless commerce engine)
- **Storefront**: Next.js 15 with React 19
- **Database**: PostgreSQL (Neon)
- **Cache**: Redis
- **Payment**: Stripe integration
- **Styling**: Tailwind CSS with Medusa UI components

### Key Features

- 🛒 Full e-commerce functionality
- 🌍 Multi-region support (Bangladesh as default)
- 💳 Stripe payment integration
- 📱 Responsive design
- 🔐 Secure authentication
- 📦 Order management
- 🎨 Customizable checkout flow
- 🇧🇩 Bangladesh-specific address fields (Police Station)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Next.js Storefront (Port 3001)               │   │
│  │  - React 19 Components                               │   │
│  │  - Server-side Rendering                             │   │
│  │  - Static Generation                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                    API LAYER                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Medusa Backend (Port 9000)                   │   │
│  │  - Store API                                         │   │
│  │  - Admin API                                         │   │
│  │  - Authentication                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
┌────────▼────────┐         ┌───────▼────────┐
│   PostgreSQL    │         │     Redis      │
│   (Neon Cloud)  │         │  (Redis Cloud) │
│   - Products    │         │  - Cache       │
│   - Orders      │         │  - Sessions    │
│   - Customers   │         │  - Queue       │
└─────────────────┘         └────────────────┘
```

---

## Backend (Medusa)

### Directory Structure

```
ojsom/
├── .medusa/              # Build artifacts
├── src/
│   ├── admin/           # Admin panel customizations
│   ├── api/             # Custom API routes
│   │   ├── admin/       # Admin-specific routes
│   │   └── store/       # Storefront routes
│   ├── jobs/            # Background jobs
│   ├── links/           # Module links
│   ├── modules/         # Custom modules
│   ├── scripts/         # Utility scripts
│   │   └── seed.ts      # Database seeding
│   ├── subscribers/     # Event subscribers
│   └── workflows/       # Custom workflows
├── medusa-config.ts     # Main configuration
├── package.json         # Dependencies
└── .env.prd            # Environment variables
```

### Core Configuration

**File**: `medusa-config.ts`

```typescript
import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    workerMode: process.env.MEDUSA_WORKER_MODE,
    http: {
      storeCors: process.env.STORE_CORS,      // Allowed storefront origins
      adminCors: process.env.ADMIN_CORS,      // Allowed admin origins
      authCors: process.env.AUTH_CORS,        // Allowed auth origins
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  }
})
```

### Key Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `REDIS_URL` | Redis connection string | `redis://default:pass@host:port` |
| `STORE_CORS` | Allowed storefront domains | `http://localhost:8000` |
| `ADMIN_CORS` | Allowed admin domains | `http://localhost:9000` |
| `JWT_SECRET` | Secret for JWT tokens | `supersecret` |
| `COOKIE_SECRET` | Secret for cookies | `supersecret` |

### API Endpoints

#### Store API (Public)
- `GET /store/products` - List products
- `GET /store/products/:id` - Get product details
- `POST /store/carts` - Create cart
- `POST /store/carts/:id/line-items` - Add to cart
- `POST /store/customers` - Register customer
- `POST /store/auth` - Customer login
- `POST /store/orders` - Place order

#### Admin API (Protected)
- `GET /admin/products` - Manage products
- `GET /admin/orders` - View orders
- `GET /admin/customers` - Manage customers
- `POST /admin/auth` - Admin login

### Database Schema (Key Tables)

```
products
├── id (uuid)
├── title (varchar)
├── description (text)
├── handle (varchar)
├── thumbnail (varchar)
├── created_at (timestamp)
└── updated_at (timestamp)

orders
├── id (uuid)
├── customer_id (uuid)
├── cart_id (uuid)
├── status (enum)
├── total (integer)
├── shipping_address (json)
├── billing_address (json)
└── payment_status (enum)

customers
├── id (uuid)
├── email (varchar)
├── first_name (varchar)
├── last_name (varchar)
├── phone (varchar)
└── addresses (json[])
```

### Running the Backend

```bash
# Install dependencies
cd ojsom
npm install

# Run database migrations
npm run build

# Seed the database (optional)
npm run seed

# Start development server
npm run dev
# Backend runs on http://localhost:9000

# Build for production
npm run build

# Start production server
npm start
```

---

## Storefront (Next.js)

### Directory Structure

```
ojsom-storefront/
├── public/              # Static assets
│   ├── favicon.ico
│   ├── logo.jpg
│   └── banner.png
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── [countryCode]/
│   │   │   ├── (main)/        # Main layout pages
│   │   │   │   ├── page.tsx   # Home page
│   │   │   │   ├── cart/
│   │   │   │   ├── products/
│   │   │   │   ├── account/
│   │   │   │   └── order/
│   │   │   └── (checkout)/    # Checkout layout
│   │   │       └── checkout/
│   │   └── layout.tsx
│   ├── lib/            # Utilities & helpers
│   │   ├── config.ts
│   │   ├── constants.tsx
│   │   ├── context/    # React contexts
│   │   ├── data/       # Data fetching
│   │   ├── hooks/      # Custom hooks
│   │   └── util/       # Helper functions
│   ├── modules/        # Feature modules
│   │   ├── account/
│   │   ├── cart/
│   │   ├── checkout/   # ⭐ Checkout flow
│   │   ├── home/
│   │   ├── layout/
│   │   ├── order/
│   │   └── products/
│   ├── styles/
│   │   └── globals.css
│   └── middleware.ts   # Request middleware
├── next.config.js
├── tailwind.config.js
└── .env.local
```

### Key Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.3.1 | React framework |
| React | 19.0.0-rc | UI library |
| TypeScript | 5.3.2 | Type safety |
| Tailwind CSS | 3.0.23 | Styling |
| Medusa JS SDK | latest | API client |
| Stripe | 1.29.0 | Payments |

### Configuration Files

#### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
    ],
  },
  // Enable experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
```

#### Environment Variables (.env.local)

```env
# Backend API URL
MEDUSA_BACKEND_URL=http://localhost:9000

# Storefront URL
NEXT_PUBLIC_BASE_URL=http://localhost:8000

# Default region (Bangladesh)
NEXT_PUBLIC_DEFAULT_REGION=bd

# Stripe public key
NEXT_PUBLIC_STRIPE_KEY=pk_test_...

# API key for backend
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...

# Revalidation secret
REVALIDATE_SECRET=supersecret
```

### Core Features

#### 1. Multi-Region Support

The middleware handles region detection:

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const countryCode = 
    request.headers.get("x-vercel-ip-country") || 
    process.env.NEXT_PUBLIC_DEFAULT_REGION || 
    "bd"
  
  // Redirect to country-specific URL
  return NextResponse.redirect(
    new URL(`/${countryCode}${request.nextUrl.pathname}`, request.url)
  )
}
```

#### 2. Data Fetching

Server-side data fetching using Medusa SDK:

```typescript
// src/lib/data/products.ts
import { sdk } from "@lib/config"

export async function getProduct(handle: string) {
  const { products } = await sdk.store.product.list({
    handle,
    fields: "*variants.calculated_price",
  })
  return products[0]
}
```

#### 3. Cart Management

```typescript
// src/lib/data/cart.ts
export async function addToCart(variantId: string, quantity: number) {
  const cartId = cookies().get("_medusa_cart_id")?.value
  
  await sdk.store.cart.createLineItem(cartId, {
    variant_id: variantId,
    quantity,
  })
  
  revalidateTag("cart")
}
```

### Running the Storefront

```bash
# Install dependencies
cd ojsom-storefront
npm install

# Start development server
npm run dev
# Storefront runs on http://localhost:3001

# Build for production
npm run build

# Start production server
npm start
```

---

## Checkout Flow

### Overview

The checkout process consists of 4 main steps:

1. **Shipping Address** - Customer enters delivery details
2. **Shipping Method** - Select delivery option
3. **Payment** - Choose and process payment
4. **Order Confirmation** - Review and place order

### Checkout Components Architecture

```
checkout/
├── templates/
│   ├── checkout-form/          # Main checkout container
│   │   └── index.tsx
│   └── checkout-summary/       # Order summary sidebar
│       └── index.tsx
└── components/
    ├── addresses/              # 📍 Address form
    │   └── index.tsx
    ├── shipping-address/       # Address input fields
    │   └── index.tsx
    ├── billing_address/        # Billing address
    │   └── index.tsx
    ├── shipping/               # Shipping method selection
    │   └── index.tsx
    ├── payment/                # Payment method selection
    │   └── index.tsx
    ├── payment-button/         # Place order button
    │   └── index.tsx
    ├── submit-button/          # Form submit button
    │   └── index.tsx
    └── review/                 # Order review
        └── index.tsx
```

### Step 1: Shipping Address Form

**Component**: `src/modules/checkout/components/addresses/index.tsx`

```typescript
"use client"

export default function Addresses({ cart, customer }) {
  const searchParams = useSearchParams()
  const isOpen = searchParams.get("step") === "address"
  
  // Auto-open if address not filled
  useEffect(() => {
    if (!cart?.shipping_address?.first_name && !isOpen) {
      router.push(pathname + "?step=address")
    }
  }, [cart?.shipping_address])

  return (
    <div>
      <Heading>Shipping Address</Heading>
      
      {isOpen ? (
        <form action={setAddresses}>
          <ShippingAddress 
            cart={cart}
            customer={customer}
          />
          <SubmitButton>Continue to delivery</SubmitButton>
        </form>
      ) : (
        <AddressSummary address={cart.shipping_address} />
      )}
    </div>
  )
}
```

**Features**:
- ✅ Auto-opens if address is empty
- ✅ Saved addresses for logged-in users
- ✅ Form validation
- ✅ Edit capability after submission

### Address Input Fields

**Component**: `src/modules/checkout/components/shipping-address/index.tsx`

```typescript
export default function ShippingAddress({ cart, customer }) {
  const [formData, setFormData] = useState({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    "police_station": "",
    "email": cart?.email || "",
  })

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Name */}
      <Input
        label="Name"
        name="shipping_address.first_name"
        value={formData["shipping_address.first_name"]}
        onChange={handleChange}
        required
      />
      
      {/* Address */}
      <Input
        label="Address"
        name="shipping_address.address_1"
        value={formData["shipping_address.address_1"]}
        onChange={handleChange}
        required
      />
      
      {/* Police Station - Bangladesh specific */}
      <Input
        label="Police Station"
        name="police_station"
        value={formData["police_station"]}
        onChange={handleChange}
        required
      />
      
      {/* District */}
      <Input
        label="District"
        name="shipping_address.city"
        value={formData["shipping_address.city"]}
        onChange={handleChange}
        required
      />
      
      {/* Phone */}
      <Input
        label="Phone"
        name="shipping_address.phone"
        value={formData["shipping_address.phone"]}
        onChange={handleChange}
        required
      />
      
      {/* Email (optional) */}
      <Input
        label="Email (optional)"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
      />
    </div>
  )
}
```

**Required Fields**:
- ✅ Name
- ✅ Address
- ✅ Police Station (Bangladesh-specific)
- ✅ District
- ✅ Phone

### Step 2: Shipping Method

**Component**: `src/modules/checkout/components/shipping/index.tsx`

Users can select from available shipping options:
- Standard Shipping
- Express Delivery
- Free Shipping (if applicable)

### Step 3: Payment

**Component**: `src/modules/checkout/components/payment/index.tsx`

Supported payment methods:
- 💳 Stripe (Credit/Debit Card)
- 💰 Cash on Delivery (Manual payment)

### Step 4: Place Order

**Component**: `src/modules/checkout/components/payment-button/index.tsx`

```typescript
export default function PaymentButton({ cart }) {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  if (isStripe(paymentSession?.provider_id)) {
    return <StripePaymentButton notReady={notReady} cart={cart} />
  }
  
  if (isManual(paymentSession?.provider_id)) {
    return <ManualTestPaymentButton notReady={notReady} />
  }

  return <Button disabled>Select a payment method</Button>
}
```

**Button States**:
- 🔴 Disabled: Missing required information
- 🟡 Loading: Processing payment
- 🟢 Enabled: Ready to place order

### Checkout Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                 Start Checkout                      │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Step 1: Shipping Address Form                      │
│  ┌───────────────────────────────────────────────┐  │
│  │  - Name (required)                            │  │
│  │  - Address (required)                         │  │
│  │  - Police Station (required) ⭐                │  │
│  │  - District (required)                        │  │
│  │  - Phone (required)                           │  │
│  │  - Email (optional)                           │  │
│  │                                               │  │
│  │  [Continue to delivery] ← Submit Button      │  │
│  └───────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────┘
                     │ Form submits to setAddresses()
                     ▼
┌─────────────────────────────────────────────────────┐
│  Step 2: Shipping Method Selection                  │
│  ┌───────────────────────────────────────────────┐  │
│  │  ○ Standard Shipping - BDT 100               │  │
│  │  ○ Express Delivery - BDT 200                │  │
│  │  ● Free Shipping - BDT 0                     │  │
│  └───────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────┘
                     │ Auto-proceeds after selection
                     ▼
┌─────────────────────────────────────────────────────┐
│  Step 3: Payment Method                             │
│  ┌───────────────────────────────────────────────┐  │
│  │  ● Cash on Delivery                          │  │
│  │  ○ Credit/Debit Card (Stripe)                │  │
│  └───────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Step 4: Review & Place Order                       │
│  ┌───────────────────────────────────────────────┐  │
│  │  Order Summary                               │  │
│  │  - Items: 2                                  │  │
│  │  - Subtotal: BDT 2,400                       │  │
│  │  - Shipping: BDT 0                           │  │
│  │  - Total: BDT 2,400                          │  │
│  │                                              │  │
│  │  [Place Order] ← notReady=false              │  │
│  └───────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────┘
                     │ Calls placeOrder()
                     ▼
┌─────────────────────────────────────────────────────┐
│         Order Confirmation Page                     │
│         ✓ Order #12345 placed successfully          │
└─────────────────────────────────────────────────────┘
```

### Recent Improvements

#### 1. Fixed Input Clearing Issue

**Problem**: Shipping address fields were clearing when users clicked anywhere on the page.

**Solution**: Modified the `useEffect` dependency array in `shipping-address/index.tsx`:

```typescript
// Before (❌ Problematic)
useEffect(() => {
  if (cart && cart.shipping_address) {
    setFormAddress(cart.shipping_address, cart.email)
  }
}, [cart]) // Runs on every cart change

// After (✅ Fixed)
useEffect(() => {
  const hasFormData = formData["shipping_address.first_name"] || 
                      formData["shipping_address.address_1"]
  
  if (!hasFormData && cart && cart.shipping_address) {
    setFormAddress(cart.shipping_address, cart.email)
  }
}, []) // Runs only on mount
```

#### 2. Added Submit Button

**Problem**: Users couldn't save their address before proceeding, making the "Place Order" button non-functional.

**Solution**: Added a submit button to the address form:

```typescript
<form action={setAddresses}>
  <ShippingAddress />
  <SubmitButton className="mt-6">
    Continue to delivery
  </SubmitButton>
</form>
```

#### 3. Simplified Payment Button

**Problem**: Payment button had complex workaround logic trying to handle address submission.

**Solution**: Removed workaround code since address form now has its own submit:

```typescript
// Before (❌ Complex)
const handlePayment = async () => {
  const addressForm = document.getElementById('address-form')
  if (addressForm) {
    // Complex validation and submission logic
  }
  onPaymentCompleted()
}

// After (✅ Simple)
const handlePayment = () => {
  setSubmitting(true)
  onPaymentCompleted()
}
```

---

## Setup & Installation

### Prerequisites

- Node.js >= 20
- npm or yarn
- PostgreSQL database
- Redis instance
- Stripe account (for payments)

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd shomvar
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd ojsom

# Install dependencies
npm install

# Create .env file
cp .env.template .env.prd

# Configure environment variables
nano .env.prd
```

**Required environment variables**:
```env
DATABASE_URL=postgresql://user:password@host/database
REDIS_URL=redis://default:password@host:port
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:9000
JWT_SECRET=your-secret-key
COOKIE_SECRET=your-cookie-secret
```

```bash
# Run migrations
npm run build

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

### Step 3: Storefront Setup

```bash
# Navigate to storefront
cd ../ojsom-storefront

# Install dependencies
npm install

# Create .env.local file
cp .env.template .env.local

# Configure environment variables
nano .env.local
```

**Required environment variables**:
```env
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_REGION=bd
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
```

```bash
# Start development server
npm run dev
```

### Step 4: Verify Installation

1. Backend: http://localhost:9000
2. Storefront: http://localhost:3001
3. Admin: http://localhost:9000/app

---

## Environment Configuration

### Backend (.env.prd)

```env
# Admin
MEDUSA_ADMIN_ONBOARDING_TYPE=nextjs
MEDUSA_ADMIN_ONBOARDING_NEXTJS_DIRECTORY=ojsom-storefront

# CORS Settings
STORE_CORS=http://localhost:8000,https://docs.medusajs.com
ADMIN_CORS=http://localhost:5173,http://localhost:9000
AUTH_CORS=http://localhost:5173,http://localhost:9000,http://localhost:8000

# Security
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret

# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Redis
REDIS_URL=redis://default:pass@host:port
```

### Storefront (.env.local)

```env
# API
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...

# Region
NEXT_PUBLIC_DEFAULT_REGION=bd

# Payment
NEXT_PUBLIC_STRIPE_KEY=pk_test_...

# Revalidation
REVALIDATE_SECRET=supersecret
```

---

## Development Workflow

### Creating New Products

1. Access admin panel: http://localhost:9000/app
2. Navigate to Products
3. Click "Create Product"
4. Fill in product details:
   - Title
   - Description
   - Price
   - Images
   - Inventory
5. Publish product

### Testing Checkout Flow

1. Add products to cart
2. Navigate to `/cart`
3. Click "Go to checkout"
4. Fill shipping address:
   - Name: Test User
   - Address: 123 Test Street
   - Police Station: Dhaka
   - District: Dhaka
   - Phone: +880 1234567890
5. Click "Continue to delivery"
6. Select shipping method
7. Choose payment method
8. Click "Place order"

### Database Seeding

```bash
cd ojsom
npm run seed
```

This creates:
- Sample products
- Categories
- Regions
- Shipping options

---

## Deployment

### Backend Deployment (Railway/Heroku)

1. **Prepare for deployment**:
```bash
cd ojsom
npm run build
```

2. **Set environment variables** in hosting platform:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `STORE_CORS` (production URL)
   - `ADMIN_CORS` (production URL)
   - `JWT_SECRET`
   - `COOKIE_SECRET`

3. **Deploy**:
```bash
git push railway main
# or
git push heroku main
```

4. **Run migrations**:
```bash
railway run npm run build
# or
heroku run npm run build
```

### Storefront Deployment (Vercel)

1. **Connect repository** to Vercel

2. **Configure build settings**:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Set environment variables**:
   - `MEDUSA_BACKEND_URL` (production backend URL)
   - `NEXT_PUBLIC_BASE_URL` (production storefront URL)
   - `NEXT_PUBLIC_DEFAULT_REGION=bd`
   - `NEXT_PUBLIC_STRIPE_KEY`
   - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
   - `REVALIDATE_SECRET`

4. **Deploy**:
```bash
vercel --prod
```

### Post-Deployment Checklist

- [ ] Backend is accessible
- [ ] Storefront is accessible
- [ ] CORS is configured correctly
- [ ] Database is connected
- [ ] Redis is connected
- [ ] Products are visible
- [ ] Checkout flow works
- [ ] Payments are processing
- [ ] Orders are being created
- [ ] Admin panel is accessible

---

## Troubleshooting

### Common Issues

#### 1. Backend Not Starting

**Symptom**: `ECONNREFUSED` or connection errors

**Solutions**:
```bash
# Check PostgreSQL connection
psql $DATABASE_URL

# Check Redis connection
redis-cli -u $REDIS_URL ping

# Verify environment variables
cat .env.prd

# Clear build cache
rm -rf .medusa
npm run build
```

#### 2. Storefront 404 Errors

**Symptom**: "Page not found" on checkout

**Solutions**:
```bash
# Verify backend is running
curl http://localhost:9000/health

# Check environment variables
cat .env.local

# Clear Next.js cache
rm -rf .next
npm run dev
```

#### 3. Cart Not Working

**Symptom**: Items not adding to cart

**Solutions**:
```bash
# Check publishable key
echo $NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

# Verify CORS settings
# In backend .env.prd
STORE_CORS=http://localhost:8000

# Check cookies in browser
# Clear cookies and try again
```

#### 4. Checkout Form Clearing

**Symptom**: Input fields clearing when clicking around

**Solution**: Already fixed in latest version. Ensure you have the updated `shipping-address/index.tsx` with the corrected `useEffect`.

#### 5. Place Order Button Disabled

**Symptom**: Button remains disabled even after filling form

**Solutions**:
1. Ensure all required fields are filled:
   - Name
   - Address
   - Police Station
   - District
   - Phone
2. Click "Continue to delivery" to save address
3. Select shipping method
4. Select payment method

#### 6. Payment Errors

**Symptom**: Payment fails or shows error

**Solutions**:
```bash
# Verify Stripe key
echo $NEXT_PUBLIC_STRIPE_KEY

# Test with Stripe test card
# 4242 4242 4242 4242
# Any future expiry date
# Any 3-digit CVC

# Check backend logs
cd ojsom
npm run dev
# Look for payment-related errors
```

### Debug Mode

Enable debug logging:

**Backend**:
```env
LOG_LEVEL=debug
```

**Storefront**:
```typescript
// next.config.js
module.exports = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}
```

### Health Checks

```bash
# Backend health
curl http://localhost:9000/health

# Check database
curl http://localhost:9000/admin/products

# Check storefront
curl http://localhost:3001/bd
```

---

## Additional Resources

- **Medusa Documentation**: https://docs.medusajs.com
- **Next.js Documentation**: https://nextjs.org/docs
- **Stripe Documentation**: https://stripe.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## Support

For issues or questions:
1. Check this documentation
2. Review error logs
3. Check Medusa Discord community
4. Create GitHub issue

---

**Last Updated**: 2024-10-28
**Version**: 1.0.0