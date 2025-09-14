# 🍔 SnackBite Restaurant Web App

A full-stack multi-tenant restaurant web application built with Next.js 15, TypeScript, Tailwind CSS 4, Supabase, and Cloudinary. SnackBite delivers a modern, responsive, and admin-manageable restaurant experience with WhatsApp ordering integration.

## ✨ Features

### 🖥️ Public Website

- Hero Section with stunning food imagery and smooth Framer Motion animations.
- Dynamic Menu System:
  . Fetches items from Supabase in real-time.
  . Category filtering for quick browsing.
  . Displays professional food photography (via Pexels or Cloudinary).

- Shopping Cart with WhatsApp integration:
  . Add/remove items.
  . Place orders directly via WhatsApp.

- Promotional Banner System:
  . Rotates through active offers.
  . Admin-manageable.

- Business Hours Display:
  . Shows current status (🟢 Open / 🔴 Closed).
  . Highlights the current day/time slot.

- Restaurant Info Section:
  . Contact details, description, location.
  . Google Maps embed placeholder for address.
  . Floating WhatsApp Button for instant support.

- Dark/Light Theme Toggle for user preference.

- SEO Optimized:
  . Proper meta tags.
  . Structured data for search engines.

- Responsive Design optimized for mobile, tablet, and desktop.

## 🔑 Admin Panel (/admin)

Accessible only to logged-in users (protected by Supabase Auth + Middleware).

- Authentication:
  . Email/password (Supabase Auth).
  . Google OAuth support (optional).
  . Middleware enforces login before accessing /admin.

- Restaurant Information Management:
  . CRUD for logo, hero/banner images, contact info, description, etc.
  . Foreign key constraint ensures each restaurant is tied to its tenant.

- Menu Management:
  . Create, edit, delete menu items in real-time.
  . Upload food images via Cloudinary.
  . Assign categories and prices.

- Promotional Banner Management:
  . Create and rotate banners.
  . Control visibility/active status.

- Business Hours Management:
  . Set daily opening and closing times.
  . Highlights current open/closed status automatically.

- Row-Level Security (RLS) policies ensure:
  . Tenants can only access their own data.
  . Admins can update/manage menu, banners, and info securely.

## 🗄️ Database Schema (Supabase)

- Core tables include:
  . menu_items → food items with category, price, image, and availability.
  . categories → menu categories (burgers, drinks, etc.).
  . promotional_banners → rotating active promotions.
  . restaurant_info → restaurant details (logo, contact, hero, about).
  . business_hours → opening/closing times for each day.
  . tenants → multi-tenant schema support.
  . app_users → admin accounts with status and role.

## 🔒 Constraints & RLS

- Unique constraints (e.g., one restaurant_info per tenant).
- Foreign key constraints (linking tenant data to restaurants).
- Status enums for tenants & users (active, inactive, suspended).

## 🛠️ Tech Stack

_-_ Framework: Next.js 15 (App Router).
\_\__Language: TypeScript.
_\__ Styling: Tailwind CSS 4.
_\__ Animations: Framer Motion.
_\__ Database: Supabase (PostgreSQL + RLS).
_\__ Auth: Supabase Auth (email/password, Google).
_\__ Storage: Cloudinary (for images).
_\_\_ Deployment: Vercel / Netlify (recommended).

## 🚀 Getting Started

1. Clone the Repository

```bash

   git clone https://github.com/pukkawit/snackbite.git
   cd snackbite

```

2. Install Dependencies

```bash

   npm install

```

3. Environment Variables

Create a .env.local file and configure:

```javascript
NEXT_PUBLIC_SUPABASE_URL = your - supabase - url;
NEXT_PUBLIC_SUPABASE_ANON_KEY = your - supabase - anon - key;
SUPABASE_SERVICE_ROLE_KEY = your - supabase - service - role;
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = your - cloud - name;
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET = your - upload - preset;
```

4. Database Setup

Run migrations/seeding from /supabase/migrations:

```bash
supabase db push

```

5. Development Server

```bash

   npm run dev

Visit http://localhost:3000

```

## 🔐 Demo Credentials

To explore the admin panel:

```javascript

Email: johnmauwa@gmail.com
Password: admin123

```

## 📖 Roadmap

✅ Batch 1: Restaurant website core features (menu, cart, banners, info).
✅ Batch 2: Admin panel CRUD with Supabase RLS + auth.
✅ Batch 3: Database constraints (unique + foreign key).
⬜ Batch 4: Multi-tenant support with subdomains.
⬜ Batch 5: Vendor onboarding & subscription management.
⬜ Batch 6: Advanced analytics & reporting.

📸 Screenshots

(Add app screenshots here for landing page, menu, admin panel, etc.)
**Hero Section**: ![hero_section](/screenshots/hero_section.png)
**Featured Section**: ![featured](/screenshots/featured.png)
**Opening Hours/Contact**: ![opening_hours_contact](/screenshots/opening_hours_contact.png)
**Categories Filter**: ![categories_filter](/screenshots/categories_filter.png)

## 🤝 Contributing

- Fork the repo
- Create a new branch: git checkout -b feature/your-feature
- Commit changes: git commit -m 'Add new feature'
- Push branch: git push origin feature/your-feature
- Create a Pull Request

## 📜 License

MIT License © 2025 SnackBite Team

## 📞 Contact

Developer: Witty Umosung (Pukkawit)
Email: [wittyumosung@gmail.com]
LinkedIn: [LinkedIn Profile](https://www.linkedin.com/in/witty-umosung)
Portfolio: [Portfolio Website](https://portfolio-witty-umosung.vercel.app)

🌟 Star this repo if you found it helpful!
Made with ❤️ and ☕ for multi-tenancy demonstration
