# Quickstart: Telemetry Dashboard

## Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Server backend running (for API)

## Setup

```bash
# Install dependencies
cd frontend
pnpm install

# Start development server
pnpm dev
```

## Development

```bash
# Run linting
pnpm lint

# Run unit tests
pnpm test:unit
```

## Building

```bash
# Build for production
pnpm build
```

## Configuration

Set environment variables in `.env`:
- `VITE_API_URL` - API base URL (default: `http://localhost:3000`)

## Project Structure

- `src/main.ts` - Application entry point
- `src/App.vue` - Root component
- `src/shared/router/` - Vue Router setup
- `src/dashboard/` - Dashboard feature module
  - `api/` - API calls
  - `components/` - Vue components
  - `composables/` - Composable functions
  - `stores/` - Pinia store
