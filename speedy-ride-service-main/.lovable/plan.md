
# SwiftRide — Ride-Hailing Web App Frontend

A complete, premium ride-hailing frontend inspired by Uber × Linear. Clean, dark-accented, mobile-first, with full rider and driver flows wired to a REST API.

---

## 🎨 Design System

Tokens added to `index.css` and `tailwind.config.ts` as semantic HSL variables:

| Token | Hex | Use |
|---|---|---|
| `--primary` | `#0F172A` | Navbar, headings, primary buttons |
| `--accent` | `#6366F1` | CTAs, active step, highlights |
| `--success` | `#10B981` | Completed badge, Accept button |
| `--warning` | `#F59E0B` | Pending states |
| `--destructive` | `#EF4444` | Errors, Reject, Cancel |
| `--background` | `#F8FAFC` | App background |
| `--card` | `#FFFFFF` | Card surfaces |
| `--foreground` | `#1E293B` | Primary text |
| `--muted-foreground` | `#64748B` | Secondary text |

Typography: Inter (system-ui fallback). Generous whitespace, soft shadows, 12px radius cards, subtle hover lifts. Mobile-first responsive grid.

---

## 📄 Pages & Routes

| Route | Page | Access |
|---|---|---|
| `/` | Landing | Public |
| `/login` | Login | Public |
| `/register` | Register (Rider/Driver toggle) | Public |
| `/dashboard` | Rider or Driver dashboard (role-based) | Protected |
| `/ride/:id` | Ride status / lifecycle | Protected |
| `/profile` | Profile (edit / delete account) | Protected |
| `/history` | Ride history | Protected |
| `*` | NotFound | Public |

### 1. Landing
- Top bar: **SwiftRide** wordmark + lightning glyph (left), **Login** & **Register** buttons (right)
- Hero: **"Your ride, in seconds."** + subcopy + primary CTA "Get started"
- Three feature tiles (Fast pickup, Transparent pricing, Trusted drivers)
- Minimal footer

### 2. Register
- Toggle pills: **RIDER** / **DRIVER**
- Fields: Full name, email, phone (Indian +91, 10-digit validation), password (min 8)
- Inline error messages under each field
- Submits to `POST /api/v1/auth/register` with `role`
- Success → toast → redirect to `/login`

### 3. Login
- Email + password
- `POST /api/v1/auth/login` → stores `accessToken` in **Zustand memory store** (not localStorage), stores `user` in store
- Redirects to `/dashboard`

### 4. Rider Dashboard
- Navbar (logo, user name, logout)
- Two-column responsive layout:
  - **Left**: Pickup input, Dropoff input, **Estimate Fare** button → `POST /api/v1/rides/estimate` (shows ₹ result), **Book Ride** button → `POST /api/v1/rides`
  - **Right**: `MapPlaceholder` (static styled map image with pin overlays)
- **Active ride card** (if present): driver name, vehicle plate, status badge, ETA
- **Recent rides** list at bottom (last 5)

### 5. Ride Status
- Full-page lifecycle:
  - Stepper: **Requested → Driver Assigned → Driver Arrived → In Progress → Completed**
  - Current step highlighted in `#6366F1` with filled circle + connector
- Driver card: avatar, name, phone (call icon), vehicle, ★ rating
- Fare card: ₹ breakdown (base, distance, total)
- **Cancel Ride** button — only visible when status is before `IN_PROGRESS`
- Polls `GET /api/v1/rides/:id` every 5s

### 6. Driver Dashboard
- **Availability switch** (AVAILABLE / OFFLINE) with colored indicator
- **Incoming request** card: pickup, dropoff, est. fare, **Accept** (green) / **Reject** (red)
- **Active ride** card with sequential action buttons: **Arrived at Pickup → Start Ride → Complete Ride** (each calls `PATCH /api/v1/rides/:id/status`)
- **Today's earnings** summary card (₹ total, # rides)
- Recent rides list

### 7. Profile
- Read-only: email, role
- Inline-editable: name, phone (pencil icon → input → Save)
- `PATCH /api/v1/users/{id}`
- **Delete account** button → confirmation modal → `DELETE /api/v1/users/{id}` → logout

### 8. Ride History
- Card list (mobile) / table (desktop)
- Columns: date, pickup, dropoff, fare, status badge
- Status badges: COMPLETED (green), CANCELLED (red), IN_PROGRESS (indigo)
- Empty state when no rides

---

## 🧩 Reusable Components

```
components/
  ui/
    Button.tsx       # variants: primary | secondary | danger | ghost; loading prop with spinner
    Input.tsx        # label, error message, icon slot
    Card.tsx         # padded white surface with soft shadow
    Badge.tsx        # status color mapping
    Spinner.tsx      # accent-colored ring
  layout/
    Navbar.tsx       # logo, user, logout
    ProtectedRoute.tsx
  maps/
    MapPlaceholder.tsx  # static styled map with pickup/dropoff pins
```

---

## 🔌 API Service Layer

```
services/
  api.ts          # axios instance, baseURL = import.meta.env.VITE_API_BASE_URL
                  # request interceptor: attach Authorization: Bearer <token> from store
                  # response interceptor: on 401 → clear store → redirect to /login
  authService.ts  # register(payload), login(payload)
  userService.ts  # getProfile(), updateProfile(id, data), deleteAccount(id)
  rideService.ts  # estimateFare, bookRide, getRide, cancelRide,
                  # updateStatus, listRides, listIncoming (driver), setAvailability
```

`.env.example` will document `VITE_API_BASE_URL`.

---

## 🗄️ Global State (Zustand)

`stores/authStore.ts` — `{ user, token, setAuth, logout }` (in-memory only)
`stores/rideStore.ts` — `{ activeRide, setActiveRide, clearRide }`

---

## 🔔 Cross-Cutting

- **Toasts**: `react-hot-toast` mounted at root for success/error feedback on every API action
- **Loading**: every async button shows inline `<Spinner />` and disables while pending
- **Error handling**: all service calls wrapped in try/catch with toast.error fallback — no crashes
- **Validation**: client-side with inline messages; phone regex `^[6-9]\d{9}$`, email standard, password min 8
- **Protected routes**: `<ProtectedRoute>` wrapper redirects to `/login` when no token in store
- **Role-based dashboard**: `/dashboard` renders Rider or Driver view based on `user.role`
- **Currency**: all fares formatted as `₹247.00` via a `formatINR()` helper

---

## 🧪 Dummy Data

Used wherever the backend isn't reachable yet, so every screen renders fully:
- Rider: **Arjun Sharma** · Driver: **Harpreet Singh**
- Vehicle: **Swift Dzire · PB-10-AB-1234** · Rating **4.8**
- Fare: **₹247.00** · Pickup: **Sector 17, Chandigarh** · Dropoff: **Chandigarh Airport**

---

## 📦 Dependencies to add
`axios`, `zustand`, `react-hot-toast`, `react-router-dom` (already present in stack baseline — will verify and install missing).

After approval I'll scaffold the design tokens, services, stores, components, and all 8 pages, then wire routing and the protected-route guard.
