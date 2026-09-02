# Project Architecture Overview

## 📁 Project Structure

```
src/
├── routes/               # TanStack Start file-based routing
│   ├── __root.tsx       # App shell (wraps all pages)
│   ├── index.tsx        # Homepage
│   ├── bijuterii/       # Jewelry department
│   ├── machiaj/         # Makeup department
│   ├── produse/         # Product listing
│   ├── [product]/       # Product detail page
│   ├── cos/             # Shopping cart
│   ├── checkout/        # Checkout page
│   └── admin/           # Admin dashboard
├── components/          # React components
│   ├── ui/             # Radix UI components
│   ├── ProductCard.tsx # Product card component
│   ├── SiteLayout.tsx  # Main layout wrapper
│   └── ...
├── lib/                # Utilities & helpers
│   ├── catalog-live.tsx    # Real-time catalog from Supabase
│   ├── store.ts            # State management
│   ├── error-capture.ts    # Error logging
│   └── ...
├── data/               # Data & constants
│   ├── catalog.ts      # Product catalog (from DB)
│   ├── types.ts        # TypeScript types
│   └── ...
├── integrations/       # External services
│   └── supabase/       # Supabase client
├── assets/             # Images, fonts, etc.
├── styles.css          # Tailwind CSS
├── server.ts           # Server entry point (SSR)
└── app.tsx             # Root app component
```

---

## 🏗️ Architecture Layers

### 1. **Frontend (React + TanStack Router)**
- 90.6% TypeScript
- Component-based UI
- File-based routing
- Real-time data with React Query

### 2. **Database Layer (Supabase/PostgreSQL)**
- 8.3% PLpgSQL
- Row Level Security (RLS)
- Real-time subscriptions
- Automatic backups

### 3. **Server (Node.js on Vercel)**
- Server-Side Rendering (SSR)
- API routes (optional)
- Environment variables
- Error handling

---

## 🔄 Data Flow

```
User Browser
    ↓
TanStack Start Router (Routing)
    ↓
React Components (UI Rendering)
    ↓
Supabase Client (API Calls)
    ↓
PostgreSQL Database (Data Storage)
    ↓
Real-time Updates (WebSocket)
    ↓
CatalogProvider (State Management)
    ↓
Components Re-render
```

---

## 🗂️ Data Management

### Catalog System
- **Source**: Supabase database
- **Provider**: `CatalogProvider` (src/lib/catalog-live.tsx)
- **Real-time**: Automatic updates via Supabase channels
- **Storage**: Modules in `@/data/catalog`

### Product Data
```typescript
Product {
  id, slug, sku
  name, description
  departmentSlug, categorySlug, brandSlug
  price, price_promotion
  stock, status
  variants, images, attributes
}
```

### Shopping Cart
- **Storage**: Browser localStorage (currently)
- **Future**: Move to Supabase for persistence
- **State**: React hooks

### Orders
- **Creation**: Checkout form → Supabase
- **Tracking**: Orders table with real-time updates
- **Status**: noua, confirmata, in_procesare, expediata, livrata

---

## 🔐 Security Architecture

```
Public Routes (Guest)
├── Homepage
├── Product catalog
├── Cart
└── Checkout (read-only)

Protected Routes (Customer)
├── My Account
├── Order History
└── Addresses

Admin Routes (Admin)
├── Dashboard
├── Product Management
├── Order Management
└── Settings
```

---

## 🚀 Performance Optimization

### Frontend
- Code splitting by route
- Image optimization
- CSS-in-JS with Tailwind
- React Query caching

### Backend
- Database indexes on common queries
- Connection pooling
- Query optimization
- CDN for static assets

### Deployment
- Vercel's edge functions
- Automatic scaling
- Zero cold starts
- Global CDN

---

## 📡 API Integration Points

### Supabase Endpoints Used
- `POST /rest/v1/auth/signup` - User registration
- `GET /rest/v1/products` - Fetch products
- `POST /rest/v1/orders` - Create orders
- Real-time channels for live updates

### External Services (Future)
- Payment Gateway (Stripe)
- Email Service (SendGrid)
- SMS Notifications (Twilio)
- Analytics (Mixpanel)

---

## 🔧 State Management

### Global State
- **Catalog**: Supabase live sync
- **User**: Supabase Auth
- **Cart**: Browser localStorage + React hooks

### Local State
- Form inputs
- UI toggles (modals, menus)
- Pagination, sorting

---

## 📊 Database Relationships

```
departments
├── categories
│   └── products
│       ├── product_images
│       ├── product_variants
│       └── product_attributes

brands
└── products

collections
└── products (many-to-many)

customers
├── addresses
├── orders
│   └── order_items
│       └── products
└── wishlists
    └── products
```

---

## 🎯 Key Features

### E-Commerce
✅ Product catalog with filtering  
✅ Shopping cart  
✅ Checkout process  
✅ Order tracking  
✅ Wishlist  
✅ Reviews & ratings  

### Admin
✅ Product management  
✅ Order management  
✅ Inventory tracking  
✅ Discount/coupon system  
✅ Customer management  
✅ Analytics dashboard  

### User Features
✅ Account management  
✅ Address book  
✅ Order history  
✅ Wishlists  
✅ Newsletter subscription  

---

## 🔄 Development Workflow

1. **Local Development**
   ```bash
   npm install
   npm run dev
   ```

2. **Code Changes**
   - Modify files in `src/`
   - Hot reload automatically

3. **Git Commit**
   - Commit changes to GitHub
   - Vercel auto-deploys on push to main

4. **Production Deployment**
   - Automatic via Vercel
   - Changes live in minutes

---

## 📈 Scalability

### Current Capacity
- ~1000 products
- ~10k orders/month
- ~1000 concurrent users

### Future Scaling
- Database read replicas
- Edge caching
- CDN optimization
- Microservices architecture

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TanStack Router, TypeScript |
| Styling | Tailwind CSS, Radix UI |
| State | React Query, Zustand |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | Vercel |
| CI/CD | GitHub Actions |
| Package Manager | npm |

---

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Security Policy](./SECURITY.md)
- [Supabase Setup](./SUPABASE.md)
- [Contributing Guide](./CONTRIBUTING.md)
