# Agent Guide

Medusa is a React Native (Expo, expo-router) Lightning wallet on top of LNbits.
This file is the short version of what you need before changing it.

## Commands

| Command           | What it does                               |
| ----------------- | ------------------------------------------ |
| `pnpm type-check` | TypeScript, no emit                        |
| `pnpm test:unit`  | Jest unit tests, offline                   |
| `pnpm test:int`   | Jest tests that call the real APIs         |
| `pnpm lint`       | ESLint (includes the React Compiler rules) |
| `pnpm format`     | Prettier check, `pnpm format:fix` to write |

CI runs all of them on every pull request.

## Layout

- `app/` screens, one file per route (expo-router)
- `machines/` state machines: pure TypeScript, no React or native imports
- `store/` zustand stores persisted in MMKV
- `hooks/` React hooks, `hooks/query` and `hooks/mutation` for TanStack Query
- `components/` shared UI (`M` prefix), `layouts/` stacks and page layouts
- `api/` HTTP and websocket clients, validated with the zod `schemas/`
- `utils/` pure helpers, `config/` constants
- `locales/` `en.json` and `pt.json`: every key goes in both
- `tests/unit` mirrors the folders above

## State machines

Anything that moves between a fixed set of modes lives in `machines/`. Each
file starts with a diagram of its states and transitions.

| Machine       | States                                          | Driven by                                            |
| ------------- | ----------------------------------------------- | ---------------------------------------------------- |
| `session.ts`  | `onboarding`, `signedOut`, `signedIn`, `locked` | `store/auth.ts`, `hooks/useAppAuthentication.ts`     |
| `appLock.ts`  | `none`, `pin`, `pinAndBiometric`                | `store/settings.ts`                                  |
| `pinEntry.ts` | `entering`, `checking`, `rejected`, `accepted`  | `hooks/usePinEntry.ts` (every screen with a PIN pad) |
| `receive.ts`  | `address`, `empty`, `invoice`                   | `app/(authenticated)/(plain)/receive.tsx`            |

Rules these follow, and new state should too:

- One value per machine. Never two booleans that can disagree
  (`pinEnabled` + `biometricEnabled`, `firstTime` + `loggedOut`).
- State only changes through the machine's transition function or reducer.
  Events that are not allowed in the current state are ignored, not thrown.
- Derive what can be derived (`isSignedIn(status)`, `getReceiveRequest(state)`)
  instead of storing a copy that has to be kept in sync.
- Machines stay pure so they can be tested without mocks
  (`tests/unit/machines`).
- Server state belongs to TanStack Query (`isPending`, `isError`), not to a
  hand-written machine.

## Persisted state

`store/auth.ts` and `store/settings.ts` are written to disk on real devices.
Changing their shape requires bumping `version`, extending `migrate` and adding
a rehydration test in `tests/unit/store`. Secrets never go in these stores: the
PIN is in `expo-secure-store` and the PIN being created is excluded with
`partialize`.
