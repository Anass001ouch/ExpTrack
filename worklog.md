# ExpTrack — Expiration Intelligence

## Project Overview

A production-ready Next.js web application for tracking product expiration dates with batch-level inventory management.

## Folder Structure

```
src/
├── app/
│   ├── globals.css          # Bespoke design system (CSS variables, Tailwind theme)
│   ├── layout.tsx           # Root layout (Space Grotesk + Inter fonts)
│   └── page.tsx             # Main orchestrator (auth state, view routing, data loading)
├── lib/
│   ├── types.ts             # TypeScript interfaces (User, Product, InventoryBatch, etc.)
│   ├── db.ts                # Mock database layer (localStorage, Supabase-style async API)
│   └── utils.ts             # Utility functions (date calc, urgency, formatting)
└── components/
    ├── login/
    │   └── LoginView.tsx    # Split-screen login/register with Framer Motion
    ├── dashboard/
    │   └── DashboardView.tsx # Main alert dashboard with urgency color-coding
    ├── products/
    │   └── ProductCatalogView.tsx # Product catalog with image upload + add modal
    └── batches/
        └── BatchTrackingView.tsx # Batch tracking with rapid multi-entry modal
```

## Database Schema

### users
| Column       | Type   | Description       |
|-------------|--------|-------------------|
| id          | string | UUID primary key  |
| email       | string | Unique email      |
| name        | string | Display name      |
| password    | string | Hashed password   |
| created_at  | string | ISO timestamp     |

### products
| Column       | Type   | Description                  |
|-------------|--------|------------------------------|
| id          | string | UUID primary key             |
| name        | string | Product name                 |
| category    | string | Category (Dairy, Bakery...)  |
| sku         | string | Optional barcode/SKU         |
| image_url   | string | Product photo URL/base64     |
| user_id     | string | FK → users.id                |
| created_at  | string | ISO timestamp                |

### inventory_batches
| Column           | Type   | Description                |
|-----------------|--------|----------------------------|
| id              | string | UUID primary key           |
| product_id      | string | FK → products.id           |
| lot_number      | string | Lot/batch identifier       |
| quantity        | number | Number of units            |
| expiration_date | string | ISO date string            |
| created_at      | string | ISO timestamp              |

## Design System

- **Background:** Textured Oatmeal (#F6F2ED)
- **Text:** Charcoal (#1C1C1C)
- **Critical:** Soft Brick Red (bg: #FEF0EC, text: #9B3B2E, accent: #C44536)
- **Warning:** Burnt Terracotta (bg: #FBF3E8, text: #8B6234, accent: #C67D4B)
- **Safe:** Muted Sage Green (bg: #EFF5EF, text: #3D6B3D, accent: #5B8C5A)
- **Heading Font:** Space Grotesk (geometric, modern)
- **Body Font:** Inter (clean, highly readable)

## Key Features

1. **Split-Screen Login** — Dark gradient mesh left panel with floating geometric animations + clean oatmeal form panel
2. **Alert Dashboard** — Urgency-sorted batch list with color-coded rows (critical/warning/safe)
3. **Product Catalog** — Product list with photo upload, category filtering, nearest-expiry indicators
4. **Batch Tracking** — Rapid multi-row entry modal for adding multiple expiration dates at once
5. **Micro-interactions** — Framer Motion page transitions, hover states, click animations, smooth modals
