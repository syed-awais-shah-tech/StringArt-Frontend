# 🧵 StringArt — Frontend Application

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Shopify--Style-Admin-008060?logo=shopify&logoColor=white" alt="Admin" />
  <img src="https://img.shields.io/badge/License-GPL--3.0-blue.svg" alt="License" />
</p>

<p align="center">
  <b>Modern artisanal customer storefront & protected Shopify-style admin order dashboard.</b><br>
  Customers upload photos, view real-time string art previews, and place Cash on Delivery (COD) orders.<br>
  Store administrators manage orders, inspect artwork, and download physical workshop nail sequences.
</p>

---

## ✨ Features

- **Customer Flow**:
  - **Hero Photo Upload**: Instant drag-and-drop or file selection (JPG, PNG, WEBP) with curated sample portraits.
  - **Real-Time Preview Simulation**: Live HTML5 canvas rendering of continuous unbroken thread paths across circular wooden boards.
  - **Before/After Transformation Slider**: Visual slider to inspect photo fidelity.
  - **Frictionless Cash on Delivery (COD)**: No customer passwords or registration required.
  - **Order Confirmation**: Instant receipt with sequential order number (`SA-1001`, etc.).

- **Admin Flow** (`/admin`):
  - **Protected Session Auth**: Only authorized store managers can access `/admin/*`.
  - **Store Overview Dashboard**: Real-time KPI metrics (Total Orders, New, In Production, Shipped).
  - **Orders Management**: Search by order number, customer name, or city with status filter tabs.
  - **Order Details**: Side-by-side artwork inspection, delivery address, status workflow updater, and direct download of physical loom sequence files (`.txt`).

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [npm](https://www.npmjs.com/) v9 or higher

### Installation

```bash
git clone https://github.com/syed-awais-shah-tech/StringArt-Frontend.git
cd StringArt-Frontend

# Install dependencies
npm install
```

### Running Locally (Development)

```bash
npm run dev
```

The client will start at [http://localhost:5173](http://localhost:5173).

> **Note on Backend Connection**: By default in development, Vite proxies all `/api` and `/data` requests to `http://localhost:3001` (where the [StringArt Backend](https://github.com/syed-awais-shah-tech/StringArt-Backend) runs).

### Production Build

```bash
# Build optimized production bundle to dist/
npm run build

# Preview production build locally
npm run preview
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` to configure environment settings:

| Variable | Description | Default (Dev) | Production Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Full URL of the backend API | *(empty - uses local proxy)* | `https://api.stringart.io` |
| `VITE_API_PROXY_TARGET` | Proxy target used by Vite dev server | `http://localhost:3001` | *(local dev only)* |

When `VITE_API_BASE_URL` is set (e.g. for standalone Vercel / Netlify / Cloudflare deployment), all API and asset requests automatically point to the specified backend URL.

---

## 📁 Project Structure

```text
StringArt-Frontend/
├── public/                 # Static assets, favicon, sample portraits
├── src/
│   ├── admin/              # Shopify-style admin dashboard
│   │   ├── AdminApp.jsx    # Admin routing & gatekeeper
│   │   ├── AdminContext.jsx# Protected session state
│   │   ├── AdminDashboard.jsx # Metric cards & recent orders
│   │   ├── AdminLayout.jsx # Sidebar & navigation shell
│   │   ├── AdminLogin.jsx  # Admin sign-in form
│   │   ├── AdminOrderDetail.jsx # Artwork, sequence & status updater
│   │   ├── AdminOrders.jsx # Orders table, search & status tabs
│   │   ├── AdminSettings.jsx # Workshop settings placeholder
│   │   └── admin.css       # Clean Shopify Polaris-inspired styles
│   ├── components/         # Customer storefront components
│   │   ├── CanvasPreview.jsx # High-performance canvas renderer
│   │   ├── CompareSlider.jsx # Before/after interactive slider
│   │   ├── FAQ.jsx         # Frequently asked questions
│   │   ├── Footer.jsx      # Footer with admin link
│   │   ├── Gallery.jsx     # Artisan portfolio
│   │   ├── HeroGenerator.jsx # Core studio generator & CTA container
│   │   ├── HowItWorks.jsx  # 4-step craft explanation
│   │   ├── Navbar.jsx      # Sticky navigation
│   │   ├── OrderForm.jsx   # Cash on Delivery checkout form
│   │   ├── OrderSuccess.jsx# Order confirmation card
│   │   └── PricingPreview.jsx # Finished art offerings & specs
│   ├── config/
│   │   └── api.js          # Centralized API & backend URL resolution
│   ├── hooks/
│   │   └── useStringArt.js # Studio state hook & API communication
│   ├── App.jsx             # Root switcher (Storefront vs. Admin)
│   ├── index.css           # Luxury artisanal design system
│   └── main.jsx            # Entry point
├── index.html
├── vite.config.js
├── .env.example
├── .gitignore
└── package.json
```

---

## 📜 License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
