# Cashflow Dashboard (React + Vite + Tailwind + Recharts)

Automate bank data consolidation and predictive dashboards. Demo uses mock data. Swap with your API.

## Quick start

```bash
npm install
npm run dev
```

## Replace data with your API

Edit `src/lib/mockData.js`. Example pattern:

```js
// src/lib/mockData.js
export async function fetchTransactions() {
  const res = await fetch('https://your-endpoint/api/transactions');
  return await res.json();
}
```

Then in `App.jsx`, use `useEffect` to load and set state.

## Features

- Summary cards: total in/out, net
- Bank breakdown table
- Daily net chart + 7-day naive forecast (moving average)
- Filters: bank and description search
- Clean Tailwind UI
