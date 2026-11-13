# Medusa Wallet

![Hero](hero.png)

# Development Requirements

- Node 22 or 24
- Pnpm
- Android Studio / XCode

# Getting Started

## Setup

1. Clone this repository

2. Navigate to the folder

```bash
cd medusa-wallet
```

3. Install dependencies

```bash
pnpm install
```

## Run

1. Run emulator, simulator or connect your device

2. Run in android or ios

```bash
pnpm ios
pnpm android
```

The `android` and `ios` folders are generated from `app.json` by
[prebuild](https://docs.expo.dev/workflow/continuous-native-generation/) and
are not committed. Run `npx expo prebuild --clean` after changing native
config or dependencies.

## Dev Tools

Read more about React Query Dev Tools [here](https://docs.expo.dev/debugging/devtools-plugins/#react-query)
