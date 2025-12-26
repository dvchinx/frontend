# JFLOREZ Suite Frontend - Copilot Instructions

## Architecture Overview

This is a React 19 + Vite SPA with **manual client-side routing** (no React Router). The app uses `App.jsx` for route management via `window.location.pathname` and conditional rendering based on `currentView` state. OAuth redirects and protected routes are handled through pathname detection.

**Backend:** All services expect a Spring Boot backend at `http://localhost:8080` (configurable in each service file).

## Component Structure & Patterns

### Folder Organization
- Components follow `ComponentName/ComponentName.jsx` + `ComponentName.css` co-location
- Three main feature domains: **auth** (Login, Register, OAuthRedirect, EmailVerification), **tasks** (Kanban board), **images** (RemoveBackground)
- Common reusable components in `components/common/` (e.g., ConfirmModal)

### Service Layer
All API calls use the **service pattern** in `src/services/`:
- **authService.js**: Authentication (register, login, OAuth, email verification)
- **taskService.js**: CRUD operations for tasks (Kanban)
- **imageService.js**: Image processing (background removal)

**Service Response Pattern:**
```javascript
return { success: true, data: responseData } // on success
return { success: false, error: errorMessage } // on failure
```

All authenticated requests use `getAuthHeaders()` which includes `Bearer ${token}` from localStorage.

## Authentication & State Management

- **No global state library**: Uses localStorage for `token` and `user` JSON object
- Token stored after login; checked on mount to determine initial view
- OAuth flow: Backend redirects to `/oauth2/redirect` → `OAuthRedirect.jsx` extracts token from URL → redirects to `/to-do`
- Protected routes check for token presence; redirect to `/` if missing

## Routing & Navigation

**Manual routing pattern in App.jsx:**
```jsx
// Pathname-based route detection
if (window.location.pathname === '/oauth2/redirect') setCurrentView('oauth-redirect')
if (window.location.pathname === '/to-do') { /* check auth */ setCurrentView('kanban') }
```

**Navigation:** Use `window.location.href = '/path'` (NOT `navigate()` or `<Link>`)

## Development Workflow

**Commands:**
- `npm run dev` - Start dev server on port 3000
- `npm run build` - Production build
- `npm run lint` - ESLint check

**React Compiler:** Enabled with `babel-plugin-react-compiler` (impacts build performance)

## Styling Conventions

- **No CSS framework**: Custom CSS per component
- **Dark theme**: Primary background `#1a1a24`, accent `#6B73FF` (purple-blue)
- **Typography**: System fonts stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI'...`)
- **Button patterns**: `.btn-primary` (purple), `.btn-secondary` (dark gray with border)
- Components use flexbox extensively; avoid grid

## Task Management (Kanban)

- **Drag-and-drop**: Native HTML5 API (no library)
- **Optimistic updates**: UI updates immediately on drag, API call fires in background, reverts on failure
- Tasks categorized by status: `TODO`, `IN_PROGRESS`, `DONE`
- Delete requires confirmation via `ConfirmModal`

## Image Processing

- **File validation**: Frontend validates file type (PNG/JPG/WEBP/BMP) and size (10MB max) before upload
- **Backend returns blob**: Response is `blob`, converted to object URL for preview
- **FormData upload**: Images sent via `FormData` with auth header (no Content-Type header to allow browser to set boundary)

## API Integration Patterns

**Hardcoded API URLs** in each service:
- Auth: `http://localhost:8080/api/auth`
- Tasks: `http://localhost:8080/api/tasks`
- Images: `http://localhost:8080/api/images`

To change backend URL, update `API_URL` constant at top of each service file.

**Error handling:** Services catch errors and return `{ success: false, error: message }` - components check `result.success` before proceeding.

## Key Files to Understand

- [src/App.jsx](src/App.jsx) - Client-side routing logic and view orchestration
- [src/services/authService.js](src/services/authService.js) - Auth patterns including OAuth
- [src/components/tasks/Kanban/Kanban.jsx](src/components/tasks/Kanban/Kanban.jsx) - Drag-and-drop implementation
- [vite.config.js](vite.config.js) - React Compiler configuration

## Common Modifications

**Add new route:** Update `App.jsx` with pathname check and view state, create component in appropriate domain folder.

**Add API endpoint:** Add function to relevant service file following the `{ success, data/error }` pattern.

**Style new component:** Create co-located CSS file, use existing color variables and button classes.
