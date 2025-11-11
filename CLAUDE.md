# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (runs on port 8080)
- **Build for production**: `npm run build`
- **Build for development**: `npm run build:dev`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

## Tech Stack & Architecture

This is a React + TypeScript frontend application built with Vite, focusing on conflict mediation services.

**Core Technologies:**
- Vite (build tool and dev server)
- React 18 with TypeScript
- React Router for navigation
- TanStack Query for data fetching
- Tailwind CSS for styling
- shadcn/ui component library (based on Radix UI)

**Key Dependencies:**
- Form handling: React Hook Form with Zod validation
- UI Components: Extensive shadcn/ui component set (@radix-ui/*)
- Icons: Lucide React
- Theme: next-themes for dark/light mode
- Charts: Recharts
- Notifications: Sonner

## Project Structure

- `src/pages/` - Page components (Index.tsx routes to ConflictMediationLanding.tsx)
- `src/components/` - Reusable components (Header, ServiceCard, TestimonialCard, MediatorCard)
- `src/components/ui/` - shadcn/ui component library
- `src/lib/utils.ts` - Utility functions
- `src/hooks/` - Custom React hooks
- `src/assets/` - Static images and media

## Important Configuration

**Path Aliases:**
- `@/` maps to `./src/`
- All imports use the `@/` alias prefix

**TypeScript Config:**
- Relaxed settings: `noImplicitAny: false`, `strictNullChecks: false`
- Path aliases configured for `@/*` imports

**ESLint Config:**
- TypeScript ESLint with React hooks plugin
- `@typescript-eslint/no-unused-vars` is disabled

**Vite Config:**
- Development server runs on `::` (all interfaces) port 8080
- Includes lovable-tagger plugin in development mode
- Path alias `@` configured

## Application Architecture

This is a single-page application focused on conflict mediation services:

1. **Routing**: Simple BrowserRouter setup with Index page and NotFound fallback
2. **State Management**: TanStack Query for server state, React state for local UI state
3. **Styling**: Utility-first with Tailwind CSS + shadcn/ui components
4. **Component Pattern**: Functional components with hooks, extensive use of shadcn/ui primitives

The main landing page (ConflictMediationLanding) appears to be a comprehensive service showcase with hero section, services, testimonials, and mediator profiles.