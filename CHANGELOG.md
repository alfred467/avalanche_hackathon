# Changelog
All notable changes to the Kelper (Kenyan Equity Legal Framework) project will be documented in this file.

## [Unreleased] - MVP Version

### Added
- **Landing Page Enhancements**: Updated navigation to include Pricing.
- **Pricing Page (`pricing.html`)**: Added a scalable SaaS pricing model (Founder Basic, Pro Startup, Enterprise) designed for the Kenyan startup ecosystem.
- **30 Live MVP Features**: Formally listed 30 live capabilities (including AI co-pilot, document rendering, local auto-save, PDF export, etc.) within the pricing page and pitch deck.
- **Pitch Deck (`PITCH_DECK.md`)**: Re-wrote the business model to reflect subscription pricing and listed the 30 MVP features to prepare for fundraising/pitching.
- **Groq AI Integration**: Integrated the `llama3-8b-8192` model via Groq API into `server.js` (`/api/ai`).
- **AI UI Component**: Added an "Ask Groq AI Assistant" panel in the generator UI to explain clauses in real-time.
- **Realistic Document View**: Styled the generator to mimic a real legal document with Times New Roman, justified text, and A4 proportions.
- **Local Auto-Save**: Implemented `localStorage` caching so users don't lose progress on refresh.
- **Action Buttons**: Added "Copy Text" and "Reset Form" actions to the generator UI.
- **Auth & Error Pages**: Added `/login`, `/signup`, and a robust `404.html` error page to handle missing routes and provide auth UI.
- **EISDIR Fix**: Fixed the local server to serve `index.html` when a directory is requested.

### Changed
- **TypeScript Backend Migration**: Completely rewrote the `server.js` backend into `server.ts`. Configured `package.json` to utilize `ts-node` for robust typed execution.
- **Asset Routing**: Fixed a core routing bug where CSS and JS assets threw `404` errors under clean URLs by instituting a smart `frontend/` directory fallback.
- Improved CSS variables across the application for robust Light/Dark mode toggling.
- Migrated the application from a "Dashboard UI" feel to a "Realistic Document Editor" feel.
