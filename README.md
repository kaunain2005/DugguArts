# Duggu Arts — Handmade Pipe Cleaner Flower Boutique

A production-ready e-commerce website for **Duggu Arts**, a handmade pipe-cleaner flower business. Built with **Next.js 15.5.9**, **React 19**, **TypeScript**, **Firebase (Auth + Firestore)**, and **Cloudinary Free**.

---

## 🌸 Features

### Customer Storefront
- **Homepage** — Hero with animated floral theme toggle, featured sections, testimonials, Instagram gallery
- **Shop** — Product grid with category filters, color filters, price sorting
- **Product Detail** — Image gallery, color selection, quantity, add to cart
- **Custom Bouquet Builder** — Multi-step form (flowers, colors, size, wrapping, budget, date)
- **Cart** — Persistent drawer + full page, quantity updates, WhatsApp checkout
- **Checkout** — Customer details, delivery address, WhatsApp order submission
- **Reviews** — Star ratings, photo uploads, featured reviews
- **About** — Brand story, team, milestones, values
- **Contact** — Form + FAQ accordion
- **Policies** — Collapsible shipping, returns, privacy, terms

### Admin Dashboard (Protected)
- **Authentication** — NextAuth.js (Google OAuth) + admin email allowlist
- **Dashboard** — Stats cards, recent orders, low-stock alerts, revenue chart
- **Products** — Full CRUD, image upload, categories, stock status
- **Orders** — Status workflow, payment tracking, customer details
- **Custom Requests** — Quote, confirm, produce, deliver workflow
- **Reviews** — Moderate (approve/reject/feature), edit, delete
- **Inventory** — Materials, stock movements, reorder levels
- **Customers** — List, search, order history
- **Settings** — Business info, WhatsApp, Instagram, charges, announcements

### Technical Highlights
- **3-Theme System** — White / Dark / Pink with animated floral toggle
- **GSAP Animations** — Scroll reveal, entrance, reduced-motion support
- **WhatsApp Checkout** — No payment gateway needed; admin confirms manually
- **Google Sheets Backend** — 12 sheets, Apps Script REST API
- **PWA Ready** — Manifest, service worker, offline-capable
- **Accessibility** — WCAG AA, keyboard nav, ARIA, prefers-reduced-motion

---

## 📦 Data Storage: Firebase + Cloudinary

All data lives in **Cloud Firestore** (via Firebase Admin SDK on the server). Images are stored in **Cloudinary Free** (no Firebase Storage used).

### Firestore Collections

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `products` | Product catalog | `productId`, `name`, `slug`, `categoryId`, `description`, `price`, `imageUrl`, `galleryUrls`, `colours`, `stockStatus`, `featured`, `active`, `createdAt`, `updatedAt` |
| `categories` | Product categories | `categoryId`, `name`, `slug`, `description`, `imageUrl`, `displayOrder`, `createdAt`, `updatedAt` |
| `orders` | Customer orders | `orderId`, `customerId`, `customerName`, `phone`, `email`, `deliveryAddress`, `subtotal`, `packagingCharge`, `deliveryCharge`, `totalAmount`, `paymentStatus`, `orderStatus`, `items` (array), `createdAt`, `updatedAt` |
| `customers` | Customer registry | `customerId`, `customerName`, `phone`, `email`, `contactConsent`, `lastLoginAt`, `createdAt`, `updatedAt` |
| `customRequests` | Custom bouquet inquiries | `requestId`, `customerName`, `phone`, `email`, `flowers`, `quantities`, `colours`, `bouquetSize`, `wrapping`, `budgetMin`, `budgetMax`, `messageCard`, `requiredDate`, `quotedPrice`, `requestStatus`, `createdAt`, `updatedAt` |
| `reviews` | Product reviews | `reviewId`, `customerName`, `customerId`, `productId`, `rating`, `title`, `reviewText`, `photoUrl`, `displayPermission`, `approvalStatus`, `featured`, `reviewDate`, `createdAt`, `updatedAt` |
| `inventoryMaterials` | Raw materials stock | `materialId`, `materialName`, `category`, `unit`, `openingStock`, `currentStock`, `unitCost`, `reorderLevel`, `createdAt`, `updatedAt` |
| `inventoryMovements` | Stock in/out/adjustment | `movementId`, `materialId`, `movementType`, `quantity`, `referenceId`, `notes`, `createdAt` |
| `settings` | Site configuration | `key`, `value`, `description` (e.g., `businessName`, `whatsappNumber`, `packagingCharge`) |
| `audit_logs` | Security/audit trail | `timestamp`, `userId`, `userEmail`, `action`, `resource`, `details` |

### Cloudinary

- **Folder structure**: `duggu-arts/products`, `duggu-arts/categories`, `duggu-arts/reviews`, `duggu-arts/custom-requests`
- **Upload**: Server-signed uploads via `/api/admin/upload` (Admin only)
- **Transformations**: Auto-optimization, format conversion, responsive sizes

---

## 🔐 Authentication: Firebase Auth

- **Providers**: Google OAuth + Email/Password
- **Session**: HTTP-only cookies (5-day expiry, `SameSite=lax`) via Firebase Admin SDK
- **Roles**: Single `/login` page for all users; admin role from `ADMIN_EMAILS` env var
- **Password linking**: Google users can link a password via `/api/auth/link-password`
- **Password reset**: Standard Firebase email flow via `/api/auth/forgot-password` + `/api/auth/reset-password`

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+** (LTS recommended)
- **npm 10+** (or pnpm/yarn)
- **Firebase Project** (Spark plan = free)
- **Cloudinary Account** (Free tier)
- **Google Cloud Project** (for OAuth credentials)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd DugguArts
rm -rf node_modules package-lock.json
npm install firebase firebase-admin cloudinary
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
# ─── Core ───
SITE_URL=http://localhost:3000
BUSINESS_NAME=Duggu Arts

# ─── Firebase (Client) ───
# Get from: Firebase Console → Project Settings → General → Your apps → Web app (</>) → Config
DUGGU_FIREBASE_API_KEY=your-api-key
DUGGU_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
DUGGU_FIREBASE_PROJECT_ID=your-project-id
DUGGU_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
DUGGU_FIREBASE_MESSAGING_SENDER_ID=123456789
DUGGU_FIREBASE_APP_ID=1:123456789:web:abcdef
DUGGU_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX  # Optional (Analytics)

# ─── Firebase (Admin / Server) ───
# Get from: Firebase Console → Project Settings → Service Accounts → Generate new private key
# Paste the ENTIRE JSON content as a single line (escape newlines as \n)
FIREBASE_ADMIN_SDK_CONFIG={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxx%40your-project.iam.gserviceaccount.com"}

# ─── Google OAuth (Firebase Auth) ───
# Get from: Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID
# Enable in: Firebase Console → Authentication → Sign-in method → Google → Enable
# Authorized redirect URIs (add both):
#   http://localhost:3000/api/auth/callback/google (dev)
#   https://your-domain.com/api/auth/callback/google (prod)
DUGGU_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxx

# ─── Session / Auth ───
# Generate with: openssl rand -base64 32
AUTH_SECRET=your-super-secret-base64-string
NEXTAUTH_URL=http://localhost:3000

# ─── Admin Access ───
# Comma-separated emails allowed to access /admin (must match Google accounts)
ADMIN_EMAILS=you@example.com,admin@example.com

# ─── Cloudinary (Image Uploads) ───
# Get from: Cloudinary Dashboard → Account Details
# Free tier: 25 GB storage, 25 GB bandwidth/month
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret
# Optional: Custom upload preset (create in Cloudinary Dashboard → Upload → Upload presets → Signing mode: Signed)
CLOUDINARY_UPLOAD_PRESET=duggu-arts-signed

# ─── Optional: Analytics / Monitoring ───
DUGGU_GA_ID=G-XXXXXXXXXX
```

### 3. Firebase Project Setup

1. **Create Firebase Project**: Go to [Firebase Console](https://console.firebase.google.com/) → Create project
2. **Enable Authentication**:
   - Authentication → Sign-in method → **Google** → Enable → Add support email
   - Authentication → Sign-in method → **Email/Password** → Enable
3. **Create Firestore Database**:
   - Firestore Database → Create database → Start in **production mode** → Choose region
   - Rules will be managed by Admin SDK (bypassed on server); client rules can be restrictive
4. **Create Web App**:
   - Project Settings → General → Your apps → Web app (</>) → Register app
   - Copy config values to `DUGGU_FIREBASE_*` vars
5. **Generate Service Account Key**:
   - Project Settings → Service Accounts → Generate new private key
   - Save JSON securely → paste entire content as single line in `FIREBASE_ADMIN_SDK_CONFIG`
6. **Configure OAuth Consent Screen** (Google Cloud Console):
   - APIs & Services → OAuth consent screen → External → Add scopes: `email`, `profile`, `openid`
   - Add test users (your admin emails) if in testing mode
7. **Create OAuth 2.0 Client ID** (Google Cloud Console):
   - APIs & Services → Credentials → Create Credentials → OAuth client ID → Web application
   - Authorized JavaScript origins: `http://localhost:3000` (dev), `https://your-domain.com` (prod)
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (dev), `https://your-domain.com/api/auth/callback/google` (prod)
   - Copy Client ID → `DUGGU_GOOGLE_CLIENT_ID`, Client Secret → `GOOGLE_CLIENT_SECRET`
8. **Enable Firebase Auth REST API** (for password reset/linking):
   - Google Cloud Console → APIs & Services → Library → Search "Firebase Authentication" → Enable

### 4. Cloudinary Setup

1. **Create Account**: Sign up at [Cloudinary](https://cloudinary.com/) (Free tier)
2. **Get Credentials**: Dashboard → Account Details → Cloud Name, API Key, API Secret
3. **Create Upload Preset** (optional but recommended):
   - Settings → Upload → Upload presets → Add upload preset
   - Signing mode: **Signed** (for server-signed uploads)
   - Folder: `duggu-arts/products` (or leave blank for dynamic)
   - Allowed formats: `jpg, jpeg, png, webp, svg`
   - Copy preset name → `CLOUDINARY_UPLOAD_PRESET`
4. **Configure Transformations** (optional):
   - Settings → Transformations → Add named transformations for responsive images

### 5. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000`.

> ⚠️ **Windows Note:** Next.js 15 has a known `EPERM` spawn issue on native Windows. Use **WSL2**, **Docker**, or deploy to **Vercel** for local development.

---

## 🛠 Developer Guide

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (store)/            # Customer-facing routes
│   │   ├── page.tsx        # Homepage
│   │   ├── shop/page.tsx   # Product listing
│   │   ├── products/[slug]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── custom-order/page.tsx
│   │   ├── reviews/page.tsx
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   └── policies/page.tsx
│   ├── admin/              # Admin dashboard (protected)
│   │   ├── layout.tsx      # Sidebar + header
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── products/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── requests/page.tsx
│   │   ├── reviews/page.tsx
│   │   ├── inventory/page.tsx
│   │   ├── customers/page.tsx
│   │   └── settings/page.tsx
│   ├── api/                # API routes (Firebase Admin SDK + Cloudinary)
│   │   ├── auth/
│   │   │   ├── register/route.ts           # Email/password registration
│   │   │   ├── login/route.ts              # Google ID token → session cookie
│   │   │   ├── logout/route.ts             # Clear session cookies
│   │   │   ├── profile/route.ts            # GET/PATCH user profile
│   │   │   ├── profile/password/route.ts   # Change password
│   │   │   ├── forgot-password/route.ts    # Send reset email
│   │   │   ├── reset-password/route.ts     # Confirm reset code
│   │   │   └── link-password/route.ts      # Link password to Google account
│   │   ├── admin/
│   │   │   ├── products/route.ts           # GET/POST products
│   │   │   ├── products/[id]/route.ts      # GET/PATCH/DELETE product
│   │   │   ├── categories/route.ts         # GET/POST categories
│   │   │   ├── categories/[id]/route.ts    # GET/PATCH/DELETE category
│   │   │   ├── orders/route.ts             # GET orders
│   │   │   ├── orders/[id]/route.ts        # GET/PATCH order
│   │   │   ├── inventory/route.ts          # GET/POST materials
│   │   │   ├── inventory/[id]/route.ts     # GET/PATCH/DELETE material
│   │   │   ├── inventory/movements/route.ts # GET/POST stock movements
│   │   │   ├── reviews/route.ts            # GET reviews
│   │   │   ├── reviews/[id]/route.ts       # GET/PATCH review
│   │   │   ├── customers/route.ts          # GET customers
│   │   │   ├── customers/[id]/route.ts     # GET/PATCH customer
│   │   │   ├── requests/route.ts           # GET requests
│   │   │   ├── requests/[id]/route.ts      # GET/PATCH request
│   │   │   ├── settings/route.ts           # GET/PATCH settings
│   │   │   ├── dashboard/route.ts          # GET dashboard stats
│   │   │   └── upload/route.ts             # Cloudinary signed upload
│   │   └── health/route.ts                 # Health check
│   ├── globals.css         # Tailwind + CSS variables + theme tokens
│   ├── layout.tsx          # Root layout, providers, fonts
│   └── page.tsx            # Redirects to /(store)/
├── components/
│   ├── 3d/                 # Interactive floral SVG (Rose, Sunflower, etc.)
│   ├── admin/              # Admin UI (tables, stats, forms)
│   ├── cart/               # CartDrawer, CartItem
│   ├── flower-stall/       # Hero floral stall (6 bouquets)
│   ├── home/               # Homepage sections
│   ├── layout/             # Navbar, Footer, AnnouncementBar
│   ├── providers/          # React Context providers
│   ├── theme/              # ThemeSwitcher (animated floral toggle)
│   └── ui/                 # shadcn/ui primitives (Button, Card, etc.)
├── context/
│   ├── ThemeContext.tsx    # 3-theme system + persistence
│   ├── CartContext.tsx     # Cart state + localStorage
│   └── ToastContext.tsx    # Toast notifications
├── hooks/
│   ├── useGSAP.ts          # GSAP scroll/entrance animations
│   └── useReducedMotion.ts
├── lib/
│   ├── firebase/           # Firebase client + admin + helpers
│   │   ├── client.ts       # Firebase client SDK init
│   │   ├── admin.ts        # Firebase Admin SDK init
│   │   ├── auth.ts         # Session cookies, requireAuth, requireAdmin
│   │   ├── permissions.ts  # Admin checks, session verification
│   │   ├── collections.ts  # Firestore collection names + TS interfaces
│   │   ├── firestore-helpers.ts # Timestamp conversion utilities
│   │   └── firestore-utils.ts   # Document data extraction
│   ├── cloudinary.ts       # Cloudinary upload/delete/helpers
│   ├── logging/            # Edge + Node loggers with file rotation
│   │   ├── index.ts
│   │   ├── node.ts
│   │   └── edge.ts
│   ├── auth/               # Client-side auth helpers
│   ├── security/           # Rate limiting, CSRF, headers, validation, audit
│   ├── utils.ts            # cn(), formatting, helpers
│   ├── constants.ts        # App constants
│   └── whatsapp.ts         # WhatsApp link builder
├── services/               # Legacy (to be removed after migration)
├── types/
│   ├── index.ts            # All shared TypeScript interfaces
│   ├── product.ts
│   ├── firebase.d.ts       # Firebase client types
│   ├── firebase-admin.d.ts # Firebase Admin types
│   └── cloudinary.d.ts     # Cloudinary types
└── middleware.ts           # Auth protection for /admin/*
public/
├── images/                 # Product images (SVG placeholders)
└── manifest.json           # PWA manifest
```

### Key Commands
```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build (fails on Windows EPERM - use WSL/Vercel)
npm run start        # Run production build
npm run lint         # ESLint (flat config)
npm run type-check   # TypeScript noEmit
```

### Adding a New Product (Admin UI)
1. Log in at `/admin/login` (Google OAuth, must be in `ADMIN_EMAILS`).
2. Go to **Products** → **Add Product**.
3. Fill in:
   - **Name**, **Slug** (auto from name), **Category**
   - **Description** (Markdown supported)
   - **Price** (INR)
   - **Images** — Upload or paste SVG/URL (primary + gallery)
   - **Colors** — Comma-separated hex codes (e.g., `#FF69B4, #FFB6C1`)
   - **Stock Status** — `in_stock` | `low_stock` | `out_of_stock` | `made_to_order`
   - **Featured** — Toggle for homepage
4. Save → Appears in shop instantly.

### Adding a Category
1. Admin → **Products** → **Categories** tab.
2. Add name, slug, description, image, display order.
3. Assign products to category.

### Managing Orders
- **Status workflow:** `new` → `contacted` → `confirmed` → `in_production` → `ready` → `dispatched` → `delivered` → `completed`
- **Payment status:** `unpaid` → `advance_received` → `partially_paid` → `paid` / `refunded`
- Click order → view items, customer, timeline, update status.

### Custom Requests Workflow
1. Customer submits at `/custom-order`.
2. Appears in Admin → **Requests** with `pending`.
2. Admin reviews → `contacted` → `quoted` (enter price) → `confirmed` → `in_production` → `ready` → `delivered`.

### Inventory Management
- **Materials** → Add raw materials (pipe cleaners, wire, wrapping paper, etc.) with unit, cost, reorder level.
- **Movements** → Record `in` (purchase), `out` (production), `adjustment`.
- Dashboard shows low-stock alerts.

---

## 🎨 Theme System

### Three Themes
| Theme | Palette | Use Case |
|-------|---------|----------|
| `white` | Clean, light, high contrast | Default/daytime |
| `dark` | Deep charcoal, muted accents | Night/low-light |
| `pink` | Soft blush, warm accents | Brand signature |

### Theme Toggle
- **Navbar:** Single animated flower icon (8 petals) — click cycles White → Dark → Pink.
- **Colors** transition smoothly during 360° rotation (~700ms).
- **Persisted** in `localStorage` (`duggu-arts-theme`).
- **Respects** `prefers-reduced-motion` (instant switch, no animation).

### CSS Variables (in `globals.css`)
```css
:root {           /* White (default) */
  --background: #FFFFFF;
  --surface: #F9F9F9;
  --primary: #D98FA4;
  --text: #292629;
  --border: #EAE6E8;
}
[data-theme="dark"] {
  --background: #171519;
  --surface: #222026;
  --primary: #E9A8B8;
  --text: #F7F0F2;
  --border: #39333B;
}
[data-theme="pink"] {
  --background: #FFF0F4;
  --surface: #FFFFFF;
  --primary: #E9A8B8;
  --text: #443A3C;
  --border: #F1D7DF;
}
```

---

## 📱 PWA & Mobile

- **Manifest:** `public/manifest.json` (name, icons, theme_color)
- **Icons:** SVG-based, all sizes generated from source
- **Service Worker:** Auto-generated by `next-pwa` (if enabled)
- **Installable:** Meets PWA criteria (HTTPS, manifest, SW)

---

## 🔒 Security

| Layer | Implementation |
|-------|----------------|
| **Auth** | Firebase Auth (Google OAuth + Email/Password), HTTP-only session cookies (5-day, `SameSite=lax`) |
| **Admin Guard** | `ADMIN_EMAILS` allowlist + middleware on `/admin/*` + server-side `requireAdmin()` in every API |
| **Server Auth** | Firebase Admin SDK verifies session cookies on every request |
| **Role-Based Access** | Single login for all users; admin role derived from `ADMIN_EMAILS` env var |
| **Rate Limiting** | Per-IP sliding window (Next.js middleware + API route guards) |
| **CSRF** | Double-submit cookie pattern on mutating endpoints |
| **Input Validation** | Zod schemas on all API routes |
| **Idempotency** | `Idempotency-Key` header on order/create endpoints |
| **Audit Log** | All admin writes create entry in `audit_logs` Firestore collection |
| **CSP** | Strict Content Security Policy via `next.config.ts` |
| **Headers** | `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` |
| **Image Security** | Cloudinary signed uploads only; no direct client uploads |

---

## 🧪 Testing Checklist

Before deploying:
- [ ] `npm run lint` — 0 errors
- [ ] `npm run type-check` — 0 errors
- [ ] `npm run build` — succeeds (on Linux/WSL/Vercel)
- [ ] Homepage loads, theme toggle cycles 3 themes
- [ ] Shop filters work (category, color, price)
- [ ] Product detail: gallery, color select, add to cart
- [ ] Cart drawer + page: quantity, remove, persist refresh
- [ ] Checkout: form validation, WhatsApp link opens
- [ ] Custom order: all 4 steps, submit → appears in admin
- [ ] Admin login: Google OAuth, only allowlisted emails
- [ ] Email/password register + login works
- [ ] Password reset flow works
- [ ] Google user can link password
- [ ] Admin CRUD: products, orders, requests, reviews, inventory
- [ ] Image upload via `/api/admin/upload` → Cloudinary → Firestore
- [ ] Reviews: submit, photo upload, admin approve/reject
- [ ] Mobile: responsive, touch targets, no horizontal scroll
- [ ] Reduced motion: animations disabled, instant theme switch
- [ ] PWA: manifest loads, icons present

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub/GitLab/Bitbucket.
2. Import project in Vercel.
3. Add **all environment variables** from `.env.local` in Vercel Project Settings → Environment Variables.
   - **Critical**: `FIREBASE_ADMIN_SDK_CONFIG` must be the entire JSON as a single line (Vercel handles newlines).
   - Set variables for **Production**, **Preview**, and **Development** environments.
4. Deploy — automatic HTTPS, CDN, edge functions.

### Environment Variables for Production

| Variable | Production Value |
|----------|------------------|
| `SITE_URL` | `https://your-domain.com` |
| `NEXTAUTH_URL` | `https://your-domain.com` |
| `DUGGU_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` (or custom domain) |
| `GOOGLE_CLIENT_SECRET` | Production OAuth client secret |
| `DUGGU_GOOGLE_CLIENT_ID` | Production OAuth client ID |
| `CLOUDINARY_*` | Same (Cloudinary works across environments) |
| `FIREBASE_ADMIN_SDK_CONFIG` | Same service account (or create separate for prod) |

### Firebase Production Config

1. **Authentication** → Settings → Authorized domains → Add your production domain
2. **Firestore** → Rules → Update if needed (Admin SDK bypasses rules)
3. **OAuth Consent Screen** → Publish app (move from Testing to Production)

### Cloudinary Production Config

- No changes needed; free tier works across environments
- Optional: Set up auto-backup or webhook notifications

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| `npm run dev` fails with `EPERM` on Windows | Use WSL2 (`wsl`), Docker, or Vercel preview |
| `next build` fails on Windows | Same — build on Linux/WSL/Vercel |
| Theme toggle not animating | Check `prefers-reduced-motion` in OS settings |
| Firebase Auth: "auth/invalid-api-key" | Verify `DUGGU_FIREBASE_API_KEY` matches Firebase Console |
| Firebase Admin: "Failed to parse private key" | Ensure `FIREBASE_ADMIN_SDK_CONFIG` has `\n` for newlines (not actual newlines) |
| OAuth redirect mismatch | Ensure authorized redirect URI exactly matches (`/api/auth/callback/google`) |
| Admin access denied | Confirm email in `ADMIN_EMAILS` (case-sensitive, must match Google account) |
| Cloudinary upload fails | Verify `CLOUDINARY_API_SECRET` and upload preset signing mode = "Signed" |
| Images not loading | Check `next.config.ts` `images.remotePatterns` includes `res.cloudinary.com` |
| Cart not persisting | Check `localStorage` not blocked; `CartContext` hydrates on mount |
| Password reset email not sent | Verify Firebase Auth → Templates → Reset password is configured; check spam folder |
| Google user can't link password | Must be signed in with Google first; then POST to `/api/auth/link-password` |

---

## 🗑 Legacy Cleanup (Post-Migration)

After verifying Firebase + Cloudinary works:
```bash
# Remove old Google Sheets / Apps Script backend
rm -rf src/services/apps-script.client.ts src/services/apps-script.server.ts
rm -rf google-apps-script/

# Remove old env vars from .env.local and Vercel
# GOOGLE_APPS_SCRIPT_URL, GOOGLE_APPS_SCRIPT_SECRET, GOOGLE_SHEET_ID
# AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET (replaced by Firebase equivalents)
```

---

## 📄 License

Proprietary — Duggu Arts. All rights reserved.

---

## 🤝 Contributing

Internal project — not open for external contributions.

---

## 📞 Support

For technical issues, contact the development team or check the audit log in the admin dashboard.

---

**Built with ❤️ for Duggu Arts — Handmade flowers that last forever.**