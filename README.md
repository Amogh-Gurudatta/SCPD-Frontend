# SIN CITY — SCPD · Frontend

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> *A high-performance, neon-noir dual-theme spatial surveillance dashboard. The LVPD's tactical terminal — now compromised by the Syndicate.*

The frontend for SCPD is a **Janus dashboard** — one application, two complete identities. Log in as a police officer and you get a clinical blue tactical terminal. Activate the Syndicate override and the entire UI glitches, transforms, and re-skins into a rust-red underground operations center.

---

## The Concept

| Identity | Theme | Color | Narrative |
|---|---|---|---|
| **LVPD Tactical Terminal** | `police` | Deep Cerulean `#0891b2` | Law enforcement surveillance ops |
| **Syndicate Node Access** | `mafia` | Rust Red `#9b2226` | Underground criminal network |

Every label, badge, icon, data field, and navigation item reflects the active faction. The switch itself is a "hack" moment — a full-screen RGB glitch animation with scanlines, channel splitting, and a tactical alert banner.

---

## Built With

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation**: [Framer Motion 12](https://www.framer.motion.com/)
- **Mapping**: [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **PDF Export**: [jsPDF](https://artskydj.github.io/jsPDF/) + [html2canvas](https://html2canvas.hertzen.com/)
- **Utilities**: `clsx`, `tailwind-merge`

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── page.tsx               # Login / gateway page
│   └── (dashboard)/
│       ├── layout.tsx             # Auth guard + navigation wrapper
│       ├── map/page.tsx           # Tactical map
│       ├── database/page.tsx      # Suspect / target database
│       ├── generator/page.tsx     # Warrant / burn order generator
│       └── warrants/page.tsx      # Warrant log
├── components/
│   ├── auth/AuthGuard.tsx         # JWT presence check + loading gate
│   ├── layout/
│   │   ├── Navigation.tsx         # Sidebar + mobile top bar
│   │   └── CustomCursor.tsx       # Theme-aware spring cursor
│   ├── map/
│   │   ├── MapWidget.tsx          # Leaflet map (SSR-disabled)
│   │   └── IncidentFeed.tsx       # Collapsible incident list panel
│   ├── database/
│   │   ├── FilterBar.tsx          # Search + status + threat filters
│   │   ├── ProfileCard.tsx        # Animated suspect/target card
│   │   └── AddRecordModal.tsx     # New record form modal
│   └── generator/
│       ├── DocumentForm.tsx       # Warrant form inputs
│       └── LivePreview.tsx        # Real-time A4 document preview
├── context/
│   ├── ThemeContext.tsx           # police/mafia theme + glitch animation
│   └── DataContext.tsx            # API polling, CRUD, token refresh
└── lib/
    ├── mockData.ts                # MapNode type + fallback node data
    └── profileData.ts             # ProfileData type + mock profiles
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 20.9.0
- A running instance of the [SCPD backend](https://github.com/your-org/scpd-backend)

### Installation

```bash
git clone https://github.com/your-org/scpd-frontend.git
cd scpd-frontend
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

For production (Vercel), set this to your Render backend URL:

```env
NEXT_PUBLIC_API_URL=https://scpd-backend.onrender.com/api/v1
```

### Run

```bash
npm run dev      # Development server → http://localhost:3000
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint
```

---

## Features

### Dual-Theme System
The entire UI — colors, labels, icons, navigation, data fields, cursor — switches between two identities. Theme persists across sessions via `localStorage`. The toggle is hidden from standard users and only appears after Syndicate session activation.

### Tactical Map (`/map`)
- Leaflet map centered on Las Vegas (`36.1716° N, 115.1391° W`) with CartoDB dark tiles.
- Incident pins pulled live from the backend, color-coded by theme accent.
- Clicking a pin or incident feed item smoothly `flyTo()`s the map to that location.
- Decorative crosshair + reticle overlay rendered in the active accent color.
- SSR disabled via `next/dynamic` to avoid Leaflet crashing on the server.

### Database (`/database`)
- Responsive grid of profile cards with search, status filter, and threat level filter.
- Cards animate out with a vertical "shred" strip effect on delete.
- Add Record modal creates new entries directly in the PostgreSQL database via the API.

### Warrant / Burn Order Generator (`/generator`)
- Live A4 document preview updates as you type — name, urgency bar, justification, status.
- A rubber stamp overlay (`APPROVED: ALPHA` / `CRITICAL HIT`) appears when urgency > 80.
- On submit: target status is updated globally, warrant is logged to the database, a PDF is exported client-side, and a Web Audio API beep plays as feedback.

### Warrant Log (`/warrants`)
- Searchable, sortable, filterable table of all warrants.
- Police users see only `WARRANT` type entries; Mafia users see all.
- Animated row transitions on filter changes.

### Secret Syndicate Activation
On the login page in Police mode:
1. Type `OVERRIDE_SYNDICATE` into the username field (field clears automatically).
2. Click the logo icon 3 times rapidly.

This triggers the Mafia session, calls the backend `/breach/` endpoint, and permanently elevates the user's Django group to `Mafia`.

---

## Architecture Notes

### State Management

| Context | Responsibility |
|---|---|
| `ThemeContext` | Active theme (`police`/`mafia`), toggle, glitch animation, `mafiaSession` flag |
| `DataContext` | API polling (5s interval), profiles, warrantLog, incidents, CRUD operations, token refresh |

### API Integration
`DataContext` wraps all fetch calls in an `apiFetch` helper that:
- Attaches the JWT Bearer token from `localStorage`.
- On a 401 response, attempts a token refresh automatically.
- On refresh failure, clears tokens and redirects to login.

### Token Handling
Tokens are stored in `localStorage` (accessible to JS — fine for a demo, not for production). The `AuthGuard` component checks for token presence and shows a loading screen until verified.

---

## Deployment (Vercel)

This project is pre-configured for Vercel deployment.

1. Push to GitHub.
2. Import the repo on [vercel.com](https://vercel.com).
3. Set the `NEXT_PUBLIC_API_URL` environment variable to your backend URL.
4. Deploy.

The backend CORS configuration already allows `https://scpd.vercel.app` and matches any `scpd*.vercel.app` preview URL via regex.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

*Built with ⚡ for HackNite 2026 · SinCity Theme · by The Shadows (Amogh Gurudatta and Aatraya Mukherjee)*
