# Duggu Arts — Handmade Pipe Cleaner Flower Boutique

A production-ready e-commerce website for **Duggu Arts**, a handmade pipe-cleaner flower business. Built with Next.js 15, React 18, TypeScript, and a Google Sheets + Apps Script backend.

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

## 📦 Data Storage: Google Sheets + Apps Script

All data lives in a **Google Spreadsheet** with 12 sheets. The frontend talks to a **Google Apps Script Web App** (deployed as "Execute as Me, Anyone with link").

### Sheet Structure

| Sheet | Purpose | Key Columns |
|-------|---------|-------------|
| `Products` | Product catalog | `productId`, `name`, `slug`, `categoryId`, `description`, `price`, `imageUrl`, `galleryUrls`, `colours`, `stockStatus`, `featured`, `active` |
| `Categories` | Product categories | `categoryId`, `name`, `slug`, `description`, `imageUrl`, `displayOrder` |
| `Orders` | Customer orders | `orderId`, `customerId`, `customerName`, `phone`, `email`, `deliveryAddress`, `subtotal`, `packagingCharge`, `deliveryCharge`, `totalAmount`, `paymentStatus`, `orderStatus`, `items` (JSON) |
| `OrderItems` | Line items per order | `orderItemId`, `orderId`, `productId`, `productNameSnapshot`, `quantity`, `unitPriceSnapshot`, `selectedColour`, `wrapping`, `messageCard`, `lineTotal` |
| `Customers` | Customer registry | `customerId`, `customerName`, `phone`, `email`, `contactConsent` |
| `CustomRequests` | Custom bouquet inquiries | `requestId`, `customerName`, `phone`, `email`, `flowers`, `quantities`, `colours`, `bouquetSize`, `wrapping`, `budgetMin`, `budgetMax`, `messageCard`, `requiredDate`, `quotedPrice`, `requestStatus` |
| `Reviews` | Product reviews | `reviewId`, `customerName`, `productId`, `rating`, `title`, `reviewText`, `photoUrl`, `displayPermission`, `approvalStatus`, `featured` |
| `InventoryMaterials` | Raw materials stock | `materialId`, `materialName`, `category`, `unit`, `openingStock`, `currentStock`, `unitCost`, `reorderLevel` |
| `InventoryMovements` | Stock in/out/adjustment | `movementId`, `materialId`, `movementType`, `quantity`, `referenceId`, `notes` |
| `Settings` | Site configuration | `key`, `value`, `description` (e.g., `businessName`, `whatsappNumber`, `packagingCharge`) |
| `AdminUsers` | Admin access control | `email`, `role`, `active` |
| `AuditLog` | Security/audit trail | `timestamp`, `user`, `action`, `resource`, `details` |

### Apps Script Modules
```
Code.gs         → Main router (doGet/doPost), CORS, auth validation
Config.gs       → Sheet names, headers, constants
Security.gs     → Rate limiting, input sanitization, LockService, idempotency
Products.gs     → Product CRUD
Categories.gs   → Category CRUD
Orders.gs       → Order create, update, status transitions
Customers.gs    → Customer CRUD
CustomRequests.gs → Custom request workflow
Reviews.gs      → Review CRUD + moderation
Inventory.gs    → Materials + movements
Settings.gs     → Settings CRUD
Dashboard.gs    → Aggregated stats for admin dashboard
Utilities.gs    → Shared helpers (sheet access, ID generation, JSON parsing)
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+** (LTS recommended)
- **npm 10+** (or pnpm/yarn)
- **Google Account** (for Sheets + Apps Script)
- **Google Cloud Project** (for OAuth credentials)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd DugguArts
rm -rf node_modules package-lock.json
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in:

```bash
# ─── Core ───
SITE_URL=http://localhost:3000

# ─── Google OAuth (NextAuth) ───
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# ─── Admin Access ───
# Comma-separated emails allowed to access /admin
ADMIN_EMAILS=you@example.com,admin@example.com

# ─── Google Apps Script Backend ───
# Deploy Apps Script as Web App → "Execute as Me" + "Anyone with link"
# Paste the deployment URL here:
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
# Shared secret (set same value in Apps Script Properties):
GOOGLE_APPS_SCRIPT_SECRET=your-shared-secret

# ─── Optional: Analytics / Monitoring ───
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 3. Google Apps Script Setup

1. Open the `google-apps-script/` folder.
2. In Google Drive, create a new **Apps Script project**.
3. Copy all `.gs` files into the project (preserve filenames).
4. Create a **Google Spreadsheet** (or use existing).
5. In Apps Script: `Resources` → `Advanced Google Services` → Enable **Google Sheets API**.
6. In `Config.gs`, set `SPREADSHEET_ID` to your spreadsheet ID.
7. Run `setupSheets()` once from the Apps Script editor to create all 12 sheets with headers.
8. Set script properties: `Project Settings` → `Script Properties` → Add `APPS_SCRIPT_SECRET` = your secret.
9. Deploy → **New Deployment** → Type: **Web App** → Execute as: **Me** → Who has access: **Anyone** → Copy URL → paste into `GOOGLE_APPS_SCRIPT_URL`.

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create/select a project → **APIs & Services** → **Credentials**.
3. **OAuth 2.0 Client ID** → Application type: **Web application**.
4. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://your-domain.com/api/auth/callback/google` (prod)
5. Copy **Client ID** and **Client Secret** into `.env.local`.

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
│   ├── api/                # API routes (proxies to Apps Script)
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── apps-script/route.ts
│   │   ├── products/route.ts
│   │   ├── categories/route.ts
│   │   ├── orders/route.ts
│   │   ├── custom-requests/route.ts
│   │   ├── reviews/route.ts
│   │   ├── settings/public/route.ts
│   │   └── admin/          # Admin-only endpoints
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
│   ├── auth/               # NextAuth config + guards
│   ├── security/           # Rate limiting, CSRF, headers, validation, audit
│   ├── utils.ts            # cn(), formatting, helpers
│   ├── constants.ts        # App constants
│   └── whatsapp.ts         # WhatsApp link builder
├── services/
│   ├── apps-script.client.ts
│   └── apps-script.server.ts
├── types/
│   ├── index.ts            # All shared TypeScript interfaces
│   └── product.ts
└── middleware.ts           # Auth protection for /admin/*
google-apps-script/         # Apps Script backend (12 modules)
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
| **Auth** | NextAuth.js (Google OAuth), JWT sessions, HTTP-only cookies |
| **Admin Guard** | `ADMIN_EMAILS` allowlist + middleware on `/admin/*` |
| **Rate Limiting** | Per-IP sliding window (Apps Script + Next.js middleware) |
| **CSRF** | Double-submit cookie pattern on mutating endpoints |
| **Input Sanitization** | Apps Script: XSS/NoSQL injection prevention |
| **Idempotency** | `Idempotency-Key` header on order/create endpoints |
| **Audit Log** | All admin actions logged to `AuditLog` sheet |
| **CSP** | Strict Content Security Policy via `next.config.ts` |
| **Headers** | `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` |

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
- [ ] Admin CRUD: products, orders, requests, reviews, inventory
- [ ] Reviews: submit, photo upload, admin approve/reject
- [ ] Mobile: responsive, touch targets, no horizontal scroll
- [ ] Reduced motion: animations disabled, instant theme switch
- [ ] PWA: manifest loads, icons present

---

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub/GitLab/Bitbucket.
2. Import project in Vercel.
3. Add all environment variables from `.env.local`.
4. Deploy — automatic HTTPS, CDN, edge functions.

### Docker (Alternative)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
- Update `SITE_URL` to your domain.
- Update `NEXTAUTH_URL` to `https://your-domain.com`.
- Add production Google OAuth redirect URI.
- Ensure `GOOGLE_APPS_SCRIPT_URL` points to production Apps Script deployment.

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| `npm run dev` fails with `EPERM` on Windows | Use WSL2 (`wsl`), Docker, or Vercel preview |
| `next build` fails on Windows | Same — build on Linux/WSL/Vercel |
| Theme toggle not animating | Check `prefers-reduced-motion` in OS settings |
| Apps Script returns 401/403 | Verify `GOOGLE_APPS_SCRIPT_SECRET` matches script property |
| OAuth redirect mismatch | Ensure authorized redirect URI exactly matches (`/api/auth/callback/google`) |
| Images not loading | Check `next.config.ts` `images.remotePatterns` includes your image host |
| Admin access denied | Confirm email in `ADMIN_EMAILS` (case-sensitive) |
| Cart not persisting | Check `localStorage` not blocked; `CartContext` hydrates on mount |

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