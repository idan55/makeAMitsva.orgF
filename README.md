# Make A Mitsva – Frontend

React + Vite single-page app for MakeAMitsva.org. Users can register, log in, view nearby mitzvot on a map, create requests, volunteer to help, chat, and admins can ban/unban users and moderate requests.

## Quick Start
- Install: `npm install`
- Run dev: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`

Backend is expected at `http://localhost:4000/api` (config in `src/Api.js`); image uploads hit `/api/upload`.

## Key Features
- **Auth**: Register, login, auto-login after signup, persistent tokens in localStorage.
- **Bans**: Banned users are blocked from creating/helping requests; loud red “BANNED!” overlay + support email. Admins can ban/unban; frontend revalidates ban state before actions.
- **Requests & Map**: Nearby requests via geolocation; create requests; claim/help; mark complete; map + scroll list with selection sync.
- **Chat**: Start and continue chats per request; notifications and unread handling.
- **Profile**: My Account shows profile, stars progress, profile image upload to Cloudinary via backend.
- **Admin**: View users/requests, ban/unban users, delete requests. User deletion is intentionally disabled.

## Notable UX Guards
- Registration requires password rules, phone normalization, and profile image upload.
- Login errors surface banned/deleted messages with support email `makeamitsva@gmail.com`.
- Banned users get inline banner plus blocking on create/help with a 3s flashing overlay followed by support info.

## Tech Stack
- React 19, Vite, React Router
- Fetch-based API client (`src/Api.js`)
- Map via Leaflet/Mapbox (see `components/Map`)
- Styling mostly inline/CSS in `src/App.css`

## Project Structure (high level)
- `src/Api.js` – API calls to backend
- `src/Authcontext.jsx` – auth provider, token/user persistence, revalidation
- `pages/` – main routed pages (Home, Register, Login, Myaccount, Admin)
- `components/` – shared UI (Header, Footer, Map, ChatWindow, etc.)

## Environment Notes
- Ensure backend is running on `localhost:4000` with matching routes.
- Geolocation prompts the browser; requests need location permission.
- Image upload expects `/api/upload` to return `{ url }` for Cloudinary storage.

## Scripts
- `npm run dev` – start dev server with HMR
- `npm run build` – production build
- `npm run preview` – preview production build
- `npm run lint` – run ESLint

## Support
If users are banned or encounter account issues, direct them to `makeamitsva@gmail.com`.
