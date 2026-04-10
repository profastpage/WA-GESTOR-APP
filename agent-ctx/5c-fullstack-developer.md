# Task 5c - Settings/Profile View

## Agent: fullstack-developer
## Status: ✅ Completed

## What was created:

### 1. Password Change API Route
**File**: `src/app/api/auth/password/route.ts`
- POST endpoint accepting `{ userId, currentPassword, newPassword }`
- Finds user by ID, validates current password (plain text, consistent with login route)
- Updates password, returns user data (without password field)
- Input validation (4-char minimum for new password)
- Proper error handling with Spanish error messages

### 2. Settings View Component
**File**: `src/components/wa-manager/settings-view.tsx`
- Exported as `SettingsView()`

#### Features implemented:
1. **User Profile Section** — Avatar with initials generated from name, displayed in a WhatsApp-green gradient circle. Shows name, email, role badge (Admin/Cliente), Pro badge, and verified badge.

2. **Edit Profile** — Inline name editing with a pencil icon button. Input appears in-place with Save/Cancel buttons. Calls `/api/auth/profile` and updates both localStorage and Zustand store.

3. **Change Password** — Collapsible form with current password, new password, and confirm password fields. Validates matching passwords and minimum length. Calls `/api/auth/password` endpoint.

4. **Theme Toggle** — Switch + Sun/Moon icons using `useTheme` from next-themes. Also includes quick-select buttons for light/dark. Switch uses WhatsApp green color.

5. **Notifications Section** — Visual card with toggles for follow-up reminders and daily summary (UI-only, consistent with MVP approach).

6. **WhatsApp Compliance Notice** — Gradient card explaining that messages are sent manually via `wa.me` links, complying with WhatsApp Business policies.

7. **App Info** — Version (v2.1.0), framework info (Next.js 16 + TypeScript), database info (SQLite + Prisma).

8. **Danger Zone** — Red-themed card with "Eliminar cuenta" button that opens an AlertDialog confirmation. On confirm, shows a toast saying the operation is disabled for safety.

#### UI Consistency:
- Uses `page-enter` animation class
- `border-0 shadow-sm` cards consistent with existing views
- WhatsApp green colors (`#25D366`, `#128C7E`, `#075E54`)
- Spanish language throughout
- Responsive design with proper spacing
- Uses shadcn/ui components: Card, Button, Input, Label, Separator, Badge, Switch, AlertDialog
- Uses lucide-react icons

## Lint & Build:
- ✅ ESLint passed with no errors
- ✅ Dev server running cleanly on port 3000
