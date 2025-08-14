NOTE: This project has been converted to remove NativeWind/Tailwind and uses inline styles.

# Eventide Market (Expo + Expo Router + NativeWind + Supabase)

A calm, nature-themed artisan marketplace app. Browse, create, and manage listings. Built with Expo Router, NativeWind (Tailwind), and Supabase.

## Quick Start

```bash
# 1) Create the project from this template (if using this repo, skip to step 2)
npx create-expo-app@latest eventide-market
cd eventide-market

# 2) Install deps
npm i

# 3) Install Expo packages for image picking (if building from scratch)
npx expo install expo-image-picker expo-file-system expo-constants

# 4) Copy .env.example to .env and fill the values
cp .env.example .env

# 5) Run the app
npm run start
```

## Env Vars

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_BUCKET` (default: `listings`)

## Tables (pre-created)

- `listings` with columns: `id (uuid, pk)`, `title (text)`, `description (text)`, `price (numeric)`, `image_url (text)`, `user_id (uuid)`, `created_at (timestamptz default now())`
- `profiles` with columns: `id (uuid, pk)`, `display_name (text)`, `avatar_url (text)`, `created_at (timestamptz default now())`

## Notes

- Ensure Storage bucket (matching `EXPO_PUBLIC_SUPABASE_BUCKET`) has public read or use signed URLs.
- RLS policies must allow users to insert/select, and restrict update/delete to `auth.uid() = user_id` for `listings`; and `auth.uid() = id` for `profiles`.
