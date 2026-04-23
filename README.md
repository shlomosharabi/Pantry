# 🏠 Pantry — Home Inventory & Shopping List PWA

A lightweight, offline-first Progressive Web App for managing home inventory and shopping lists. Deployable on GitHub Pages (zero backend).

---

## 📁 Project Structure

```
pantry-pwa/
├── public/
│   └── icons/            ← PWA icons (192px, 512px)
├── src/
│   ├── components/
│   │   ├── UI.jsx         ← Shared primitives (Badge, Button, Input…)
│   │   ├── ItemForm.jsx   ← Add/edit form (shared by both tabs)
│   │   ├── InventoryTab.jsx
│   │   └── ShoppingTab.jsx
│   ├── hooks/
│   │   └── useStorage.js  ← All LocalStorage logic + data model
│   ├── App.jsx            ← Root: tab nav, state wiring
│   ├── main.jsx           ← Entry point
│   └── index.css          ← Tailwind + safe-area utilities
├── index.html
├── vite.config.js         ← Vite + vite-plugin-pwa config
├── tailwind.config.js
└── .github/workflows/deploy.yml
```

---

## 🗃️ Data Model (LocalStorage)

Two keys in `localStorage`:

### `pantry_inventory` → `InventoryItem[]`
```json
{
  "id":        "1720000000000-abc123",
  "name":      "Olive Oil",
  "quantity":  2,
  "unit":      "bottle",
  "expiresAt": "2024-10-15T00:00:00.000Z",
  "addedAt":   "2024-07-03T10:00:00.000Z"
}
```

### `pantry_shopping` → `ShoppingItem[]`
```json
{
  "id":       "1720000000001-def456",
  "name":     "Milk",
  "quantity": 2,
  "unit":     "L",
  "done":     false,
  "addedAt":  "2024-07-03T10:05:00.000Z"
}
```

---

## 🧩 Component Architecture

```
App
├── AlertBanner          ← Expiry warnings (inventory items)
├── Tab navigation
├── InventoryTab
│   ├── Search bar
│   ├── ItemForm (add)
│   ├── Edit modal → ItemForm (edit)
│   └── InventoryRow[]
│       └── Badge (expiry status)
└── ShoppingTab
    ├── ItemForm (add)
    ├── Progress bar
    ├── ShoppingRow[] (pending)
    └── ShoppingRow[] (completed)
```

**State management**: plain `useState` + `useCallback` in custom hooks. No Redux, no Context needed — state lives in two hooks (`useInventory`, `useShopping`) hoisted into `App`.

---

## ⚙️ PWA Setup

`vite-plugin-pwa` handles everything:
- Generates `manifest.webmanifest` at build time from the config in `vite.config.js`
- Injects a Workbox service worker with precaching of all built assets
- Adds `<link rel="manifest">` to `index.html` automatically
- `registerType: 'autoUpdate'` silently updates the SW on new deploys

### Service Worker Strategy
- **App shell** (JS, CSS, HTML): `CacheFirst` via Workbox precache
- **Google Fonts**: `CacheFirst`, 1 year TTL
- **Runtime**: Workbox handles stale-while-revalidate by default

---

## 🚀 Deploy to GitHub Pages

### Step 1 — Create your repo
```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/pantry-pwa.git
```

### Step 2 — Set the base path
In `vite.config.js`, change:
```js
base: '/pantry-pwa/',
// → replace 'pantry-pwa' with your actual GitHub repo name
```

Also update `scope` and `start_url` in the manifest section to match.

### Step 3 — Add PWA icons
Place two PNG icons in `public/icons/`:
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)

You can generate them from any square image using https://realfavicongenerator.net

### Step 4 — Enable GitHub Pages
Go to your repo → **Settings → Pages → Source → GitHub Actions**

### Step 5 — Push and deploy
```bash
git add .
git commit -m "feat: initial pantry PWA"
git push -u origin main
```

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically build and deploy. Your app will be live at:
```
https://YOUR_USERNAME.github.io/pantry-pwa/
```

### Step 6 — Install on mobile
Visit the URL in Chrome (Android) or Safari (iOS), then use **"Add to Home Screen"** from the browser menu. The app will install as a standalone PWA.

---

## 🖥️ Local Development

```bash
npm install
npm run dev
# → http://localhost:5173/pantry-pwa/
```

```bash
npm run build    # production build
npm run preview  # preview the built output
```

---

## 🔌 Offline Behavior

1. First visit: service worker installs and caches all assets
2. Subsequent visits: app loads instantly from cache, even with no network
3. All data is in `localStorage` — 100% local, never sent anywhere
4. SW updates silently in the background when you push a new version

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `react` + `react-dom` | UI framework |
| `vite` | Build tool |
| `@vitejs/plugin-react` | React fast refresh |
| `vite-plugin-pwa` | Service worker + manifest generation |
| `tailwindcss` | Utility CSS |
| `autoprefixer` + `postcss` | CSS processing |

**Zero runtime dependencies beyond React.** No icon library, no router, no state manager.
