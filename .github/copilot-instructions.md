# Copilot Instructions for Eventide Market

## Project Overview
- **Type:** Expo React Native app using Expo Router and Supabase
- **Purpose:** Marketplace for browsing, creating, and managing artisan listings
- **Key Tech:** Expo, Expo Router, React Native, Supabase, inline styles (no Tailwind)

## Architecture & Data Flow
- **App structure:**
  - All screens are in `app/` using Expo Router conventions (e.g., `(auth)/login.tsx`, `(tabs)/index.tsx`)
  - Listing details: `app/listing/[id].tsx`
  - Shared UI components: `components/` (e.g., `PrimaryButton.tsx`, `ListingCard.tsx`)
  - Auth and user state: `context/AuthContext.tsx`
  - Supabase integration: `lib/supabase.ts`
  - Custom hooks: `hooks/`
- **Data:**
  - Listings and profiles are stored in Supabase tables (`listings`, `profiles`)
  - Images are uploaded to a Supabase Storage bucket (see `useStorageUpload.ts`)

## Developer Workflows
- **Start app:** `npm run start` (runs Expo)
- **Install dependencies:** `npm i`
- **Environment:** Copy `.env.example` to `.env` and fill in Supabase values
- **Image upload:** Uses Expo Image Picker and Supabase Storage (see `useImagePicker.ts`, `useStorageUpload.ts`)
- **No Tailwind:** All styles are inline JS objects (see `PrimaryButton.tsx`)

## Project Conventions
- **Routing:** Follows Expo Router file-based routing; use folder names in parentheses for grouping (e.g., `(auth)`, `(tabs)`)
- **Component patterns:**
  - UI components accept `style` props for customization
  - Loading states handled via `loading` prop (see `PrimaryButton.tsx`)
- **State management:** Use React Context for auth/user state
- **API:** All backend calls go through Supabase client in `lib/supabase.ts`

## Integration Points
- **Supabase:**
  - Auth, database, and storage
  - Env vars: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_SUPABASE_BUCKET`
- **Expo:**
  - Image picking: `expo-image-picker`
  - File system: `expo-file-system`

## Examples
- To add a new screen: create a file in `app/` (e.g., `app/my-new-screen.tsx`)
- To add a new listing: use hooks in `hooks/useListings.ts` and UI in `components/FormField.tsx`

## References
- See `README.md` for setup and environment details
- See `lib/types.ts` for shared types
- See `context/AuthContext.tsx` for auth logic

---
For more, see https://aka.ms/vscode-instructions-docs
