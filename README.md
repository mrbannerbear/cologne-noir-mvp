# Cologne Noir MVP

A premium perfume decant e-commerce platform with a "Sleek, Modern, Black & White" brutalist luxury aesthetic.

## Tech Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **UI Library:** shadcn/ui for minimal, monochromatic components
- **Backend/BaaS:** Supabase (Auth, Database, Storage, Realtime)
- **State:** React Query (TanStack Query) for async data management
- **Animations:** GSAP for modal animations
- **Payments:** Cash on Delivery (COD) and bKash

## Features

- 🛒 Full e-commerce functionality (browse, cart, checkout)
- 👤 User authentication (login, register)
- 📦 Order management and tracking
- 🏷️ Product management with multiple size options (10ml, 15ml, 30ml, 100ml)
- 💧 Inventory tracking with volume management
- 📊 Admin dashboard with KPIs
- 🔄 Realtime stock updates
- 💳 COD and bKash payment options

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone the repository

```bash
git clone https://github.com/mrbannerbear/cologne-noir-mvp.git
cd cologne-noir-mvp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Go to SQL Editor and run the migration file located at `supabase/migrations/00001_initial_schema.sql`
3. Copy your project URL and anon key from Project Settings > API

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
app/
├── (auth)/                 # Authentication pages (login, register)
├── (customer)/             # Customer-facing pages
│   ├── products/           # Product listing and details
│   ├── cart/               # Shopping cart
│   ├── checkout/           # Checkout flow
│   └── orders/             # Order history
├── admin/                  # Admin dashboard
│   ├── orders/             # Order management
│   ├── products/           # Product management
│   ├── customers/          # Customer management
│   ├── inventory/          # Volume tracking
│   └── supplies/           # Supply management
components/
├── admin/                  # Admin-specific components
├── cart/                   # Cart components
├── checkout/               # Checkout components
├── customers/              # Customer components
├── layout/                 # Layout components (header, footer, sidebar)
├── products/               # Product components
├── providers/              # React context providers
├── shared/                 # Shared components
└── ui/                     # shadcn/ui components
hooks/                      # Custom React hooks
lib/
├── supabase/               # Supabase client utilities
├── validations/            # Zod validation schemas
├── constants.ts            # App constants
└── utils.ts                # Utility functions
types/                      # TypeScript type definitions
supabase/
└── migrations/             # Database migrations
```

## Design Philosophy

- **Palette:** Strictly Monochrome. Backgrounds: stark white (#ffffff) or deep black (#050505). High-contrast text.
- **Typography:** Playfair Display (serif) for headings, Inter (sans-serif) for body text
- **Vibe:** Minimalist, ample whitespace, "brutalist luxury." No shadows, sharp borders only.
- **Micro-interactions:** Subtle hover states, translate effects on cards
- **Modals:** GSAP animations for smooth open/close transitions

## Admin Access

To create an admin user:
1. Register a new user through the app
2. Update the user's role in Supabase:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
   ```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query)

## License

MIT
