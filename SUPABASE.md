# 🗄️ Supabase Integration Guide

## Database Setup

Your application uses **Supabase** (PostgreSQL) for data storage.

### Quick Setup

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up with GitHub
   - Create a new project

2. **Get API Keys**
   - Project Settings → API
   - Copy `SUPABASE_URL` and `SUPABASE_ANON_KEY`
   - Add to Vercel Environment Variables

3. **Run Migrations**
   - Database schema is auto-created from migrations
   - Tables: products, categories, orders, customers, etc.

---

## 📊 Database Schema

### Core Tables

#### **departments**
- id, slug, name, description, active, position

#### **categories**
- id, slug, name, departmentSlug, active, position

#### **brands**
- id, slug, name, active, position

#### **collections**
- id, slug, name, description, image, active, position

#### **products**
- id, slug, sku, name, description
- departmentSlug, categorySlug, brandSlug
- price, price_promotion, discount_type, discount_value
- stock, status, is_featured, is_bestseller
- created_at, updated_at

#### **product_images**
- id, productId, url, position, created_at

#### **product_variants**
- id, productId, label, sku, price, stock, image

#### **orders**
- id, number, customerId, status, total
- shipping_address, payment_method, notes
- created_at, updated_at

#### **order_items**
- id, orderId, productId, quantity, price

#### **customers**
- id, email, name, phone, addresses, preferences
- created_at, updated_at

---

## 🔐 Row Level Security (RLS)

Enable RLS on sensitive tables:

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
```

Example policy (public read, admin write):

```sql
CREATE POLICY "Allow public read" ON products
  FOR SELECT USING (status = 'activ');

CREATE POLICY "Allow admin write" ON products
  FOR UPDATE USING (auth.uid() = admin_id);
```

---

## 🔄 Real-Time Updates

Your app uses Supabase's real-time channel for live catalog updates:

```typescript
const channel = supabase.channel('catalog-live');
channel.on('postgres_changes', { event: '*', table: 'products' }, () => {
  // Catalog updated
});
```

---

## 📝 Common Queries

### Get Active Products

```typescript
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('status', 'activ')
  .order('created_at', { ascending: false });
```

### Get Order Details

```typescript
const { data } = await supabase
  .from('orders')
  .select(`
    *,
    order_items(*, products(*))
  `)
  .eq('id', orderId);
```

### Update Inventory

```typescript
await supabase
  .from('products')
  .update({ stock: newStock })
  .eq('id', productId);
```

---

## 🚨 Common Issues

### "Supabase key is missing"
→ Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to `.env.local`

### "RLS policy violates access"
→ Enable public access or create proper RLS policies

### "Real-time updates not working"
→ Check Supabase project settings → Realtime tab

---

## 📚 Resources

- Supabase Docs: https://supabase.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- RLS Guide: https://supabase.com/docs/guides/auth/row-level-security

---

## 🔐 Best Practices

1. **Use environment variables** for all API keys
2. **Never log API keys** to console in production
3. **Implement RLS policies** for data protection
4. **Use prepared statements** to prevent SQL injection
5. **Validate all inputs** on server before database
6. **Monitor database usage** in Supabase dashboard
7. **Regular backups** through Supabase dashboard
