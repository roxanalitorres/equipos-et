# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Equipos ET is a B2B inventory management and sales system for heavy machinery spare parts (Caterpillar, Komatsu) across two Ecuadorian branches: Puyo and El Topo. It uses an Internet Computer (IC) blockchain backend written in Motoko and a React/TypeScript frontend.

## Commands

### Frontend (`src/frontend/`)
```bash
pnpm install --prefer-offline  # Install dependencies
pnpm dev                        # Development server
pnpm build                      # Production build
pnpm typecheck                  # TypeScript type check
pnpm check                      # Biome lint check
pnpm fix                        # Biome lint fix
```

### Backend (`src/backend/`)
```bash
mops install       # Install Motoko dependencies
mops check --fix   # Type check and fix
mops build         # Build canister
```

### Root
```bash
pnpm bindgen   # Generate TypeScript bindings from Motoko IDL (required after backend changes)
pnpm build     # Build all packages
pnpm typecheck # Type check all packages
pnpm check     # Lint all packages
pnpm fix       # Fix linting all packages
```

> **Important:** After changing the Motoko backend, always run `pnpm bindgen` from root before working on the frontend. This regenerates `src/frontend/src/backend.ts` and `src/frontend/src/backend.d.ts`.

## Architecture

### Monorepo Structure
- `pnpm` workspaces with two packages: `src/backend` and `src/frontend`
- `mops.toml` / `mops.lock` at root for Motoko package management

### Backend (Motoko — `src/backend/`)
Internet Computer smart contract using a mixin-based architecture:

- `main.mo` — Main actor that composes all mixins with authorization
- `types/*.mo` — Shared type definitions per domain (products, inventory, sales, users, common)
- `lib/*.mo` — Business logic (pure functions, data manipulation)
- `mixins/*-api.mo` — IC-exposed query/update endpoints per domain

Domains: **users**, **products**, **inventory**, **sales**, **services**

Authorization is handled via `caffeineai-authorization` mixin; role-based access (Admin, Vendor, Technician) is enforced at the mixin level.

Data is stored in Motoko in-memory `Map` and `List` collections (no external database).

### Frontend (React — `src/frontend/src/`)
- **Auth:** Internet Identity via `@dfinity/auth-client`; `useAuth.ts` hook wraps the IC auth flow
- **API layer:** `useBackend.ts` (main hook) abstracts all canister calls; uses auto-generated bindings from `backend.ts`
- **Server state:** TanStack React Query for caching/sync of canister responses
- **Global state:** Zustand for UI state (active branch, modals)
- **Routing:** TanStack React Router; routes defined in `App.tsx`
- **Branch context:** `EmpresaContext` / `useBranch` — most data queries are scoped by branch (Puyo / El Topo)

Component layers:
- `src/components/ui/` — Radix UI primitive wrappers (48 components, largely unstyled)
- `src/components/shared/` — Domain-agnostic UI (Badge, Modal, Table, PageHeader, LoadingSpinner, EmptyState)
- `src/pages/` — Page-level components; one file per route

### Frontend ↔ Backend Integration
The file `src/frontend/src/backend.ts` (auto-generated, ~62KB) contains the full Candid service interface. Never edit this file manually — regenerate with `pnpm bindgen`.

## Design System

Defined in `DESIGN.md`. Key rules:
- **Colors:** OKLCH color space; primary = steel blue, accent = signal orange, success = sage green
- **Typography:** Bricolage Grotesque (headers), General Sans (body), Geist Mono (part numbers / codes)
- **Shape:** 4px border-radius (industrial, not rounded), 12/16px spacing grid, tight information density
- **Tables:** Monospace part numbers flush-left, zebra striping with `muted/30`
- **Motion:** `transition-smooth` (0.3s ease-out), no entrance animations, spinner overlay for loading
- **Print:** Invoices/proformas render white background with print-safe margins (1.5cm), greyscale-friendly

## Domain Concepts

- **Branch (Empresa):** Puyo or El Topo — nearly all queries are branch-scoped
- **Documents:** Proformas (PRO-####) and Invoices (FAC-####); proformas can be converted to invoices
- **Roles:** Admin (full access), Vendor (sales + inventory view), Technician (services + inventory view)
- **Part numbers:** Displayed in monospace; physical location tracked per branch (shelf/row)
