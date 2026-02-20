# MarketNest – Fashion Marketplace

A full-stack mini fashion marketplace web application with role-based access for **Brands** (sellers) and **Users** (customers). Built with React (Vite), TypeScript, and Supabase.

---

## Features

### Authentication & Sessions
- Signup with role selection (Brand or User)
- Login and logout
- Persistent session handling
- Protected routes with role-based access
- Unauthorized access prevention

### Brand (Seller)
- Brand Dashboard
- Create, edit, delete products
- Upload product images (JPG, PNG, WebP, max 2MB)
- View only their own products

### User (Customer)
- Marketplace with all products
- View product details
- Pagination (Load More)
- Update profile info
- Cannot edit/delete products or access Brand dashboard

---

## Tech Stack

- **Frontend:** React 18, Vite, TypeScript, React Router, Tailwind CSS
- **Backend:** Supabase (Auth, Database, Storage, Row Level Security)

---

## Project Structure

```
MarketNest/
├── public/
│   └── logo.svg
├── src/
│   ├── components/          # Reusable UI
│   │   ├── Layout.tsx       # Header, nav, main wrapper
│   │   ├── ProtectedRoute.tsx
│   │   ├── ProductCard.tsx
│   │   ├── CartItem.tsx
│   │   ├── WishlistButton.tsx
│   │   └── RatingStars.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   ├── WishlistContext.tsx
│   │   └── MarketplaceContext.tsx
│   ├── lib/
│   │   └── supabase.ts      # Supabase client init
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Marketplace.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── BrandDashboard.tsx
│   │   ├── ProductForm.tsx
│   │   ├── Profile.tsx
│   │   ├── Cart.tsx
│   │   ├── Wishlist.tsx
│   │   └── Checkout.tsx
│   ├── services/            # API / Supabase calls
│   │   ├── authService.ts
│   │   ├── profileService.ts
│   │   ├── productService.ts
│   │   ├── cartService.ts
│   │   ├── wishlistService.ts
│   │   ├── ratingService.ts
│   │   └── storageService.ts
│   ├── types/
│   │   └── database.ts      # TS types for tables
│   ├── utils/
│   │   └── validation.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── migrations/
│       ├── 00001_init_schema.sql
│       ├── 00002_add_ecommerce_tables.sql
│       └── 00003_fix_ratings_public_read.sql
├── .env.example
├── vercel.json              # SPA rewrite for routing
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## Database Schema

### `profiles`
| Column     | Type      | Description                    |
|------------|-----------|--------------------------------|
| id         | UUID (PK) | References auth.users          |
| name       | TEXT      | Display name                   |
| role       | TEXT      | `brand` \| `user`             |
| created_at | TIMESTAMPTZ | Auto                          |
| updated_at | TIMESTAMPTZ | Auto                          |

### `products`
| Column     | Type      | Description                    |
|------------|-----------|--------------------------------|
| id         | UUID (PK) | Auto-generated                 |
| brand_id   | UUID (FK) | References profiles.id         |
| name       | TEXT      | Product name                   |
| description| TEXT      | Product description            |
| price      | NUMERIC   | Price (>= 0)                   |
| category   | TEXT      | Optional                       |
| image_url  | TEXT      | Product image URL              |
| created_at | TIMESTAMPTZ | Auto                        |
| updated_at | TIMESTAMPTZ | Auto                        |

---

## Row Level Security (RLS)

### Profiles
- Users can read and update only their own profile
- Profile created automatically on signup via trigger

### Products
- **SELECT:** Any authenticated user can read products
- **INSERT:** Only brands can insert; must be their own (brand_id = auth.uid())
- **UPDATE:** Only brands can update their own products
- **DELETE:** Only brands can delete their own products

### Storage (product-images bucket)
- Brands can upload/update/delete images in their folder (`{userId}/*`)
- Anyone can view (public read)

---

## API Endpoints (Supabase)

All data access goes through the Supabase client:

- **Auth:** `supabase.auth.signUp`, `signInWithPassword`, `signOut`, `getSession`
- **Profiles:** `supabase.from('profiles').select/update`
- **Products:** `supabase.from('products').select/insert/update/delete`
- **Storage:** `supabase.storage.from('product-images').upload`

---

## Authentication Flow

1. **Signup:** User submits email, password, name, role. Supabase creates auth user, trigger creates profile with role.
2. **Login:** Supabase validates credentials, returns session. Client stores session (Supabase handles persistence).
3. **Protected Routes:** `ProtectedRoute` checks session and profile role; redirects unauthenticated or wrong-role users.
4. **Logout:** `supabase.auth.signOut()` clears session.

---

## Storage Handling

- **Bucket:** `product-images` (public)
- **Path:** `{userId}/{uuid}.{ext}` (one folder per brand)
- **Validation:** JPG/PNG/WebP, max 2MB
- **Flow:** File selected → validate → upload to Supabase Storage → get public URL → save URL in `products.image_url`

---

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API** for URL and anon key
3. Copy `.env.example` to `.env` and fill in:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database setup

In **Supabase Dashboard → SQL Editor**, run the contents of:

`supabase/migrations/00001_init_schema.sql`

### 4. Storage bucket

In **Supabase Dashboard → Storage**:

1. Create bucket: `product-images`
2. Set to **Public**
3. Storage RLS policies are in the migration; if needed, add via Dashboard:
   - Insert: `bucket_id = 'product-images'` AND `(storage.foldername(name))[1] = auth.uid()::text`
   - Update/Delete: same condition
   - Select: `bucket_id = 'product-images'` for public read

### 5. Run app

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Deployment

### Build

```bash
npm run build
```

Output in `dist/`. Deploy to Vercel, Netlify, or similar.

### Environment

Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in your hosting platform.

---

## Security Notes

- Passwords hashed by Supabase Auth (bcrypt)
- Input validation on frontend and via DB constraints
- RLS enforces access at the database layer
- Anon key is safe for client; never expose service role key
