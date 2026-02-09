
# BioStock Pro | Laboratory Inventory Management

A specialized, high-performance SPA for tracking oligos, kits, and polymerases in a bio-laboratory setting.

## Key Features
- **Visual Analytics**: Real-time progress bars with dynamic color grading (>70% Green, 30-70% Yellow, <30% Critical Red).
- **Intelligent Alerts**: Critical items exhibit a pulsing glow and a shake animation to prompt restocking.
- **In-Memory API**: Fully simulated RESTful lifecycle with state persistence within the current session.
- **Glassmorphism UI**: optimized for dark lab environments with high contrast and focus-friendly aesthetics.

## Quick Start
1. Ensure all files are in the same root directory.
2. Serve locally:
   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in any modern browser.

## Tech Stack
- **React 19**: Component architecture.
- **Tailwind CSS**: Utility-first styling with custom glass filters.
- **Recharts**: Data visualization for consumption history.
- **TypeScript**: Type safety for complex lab data models.

## Persistence Note
**Crucial**: This application is a pure front-end simulation. Data changes are stored in system RAM. **Reloading the page will reset the inventory** to the default values defined in `api.ts`.
