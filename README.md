# GeoBit

GeoBit is a sentiment-driven country market trading platform that introduces a new, swipe-based trading experience.

## Concept Overview
Social media sentiment often reacts strongly to positive or negative news about a country. GeoBit transforms this collective sentiment into a **country-based index**, allowing users to speculate on market direction (long or short) through an intuitive, mobile-first interface.

Instead of traditional order forms, GeoBit introduces **swipe interactions** to open trading positions, making trading feel more accessible and social-media-native.

Currently in MVP (Minimum Viable Product) stage.

## Tech Stack

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Web3:** Viem, Wagmi

## Features

- Country market list
- Index chart visualization
- Wallet connection
- Real-time oracle data
- Swipe-to-trade functionality for opening positions

## Pages

### 1. Home Page (`/`)
The home page provides general information about the application and its purpose.

### 2. Market (`/Market`)
This page displays open markets for each country, showing:
- Current price
- Price change percentage
- Price position chart

### 3. Trade (`/Trade`)
Experience a new way of trading through our innovative swipe-based card interface to open trading positions.

### 4. Portfolio (`/portfolio`)
Manage your trading activities:
- Deposit funds
- Withdraw funds
- Close positions (all or partial)

## Data Source

All market data is fetched from on-chain oracle events.

## Installation

Install dependencies:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

### Production

Build and start the production server:

```bash
npm run build
npm start
```


## Target Audience

This project was developed for hackathon judges, but our broader target audience includes general users, especially those active on social media platforms.
