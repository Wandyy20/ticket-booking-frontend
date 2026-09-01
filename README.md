# Ticket Booking — Frontend

A React frontend for the [Ticket Booking API](https://github.com/<your-username>/ticket-booking) — a concurrency-safe flight booking backend. This app handles the full booking flow: browse flights, pick seats on a visual cabin map, and confirm a booking.

## What it does

- Browse available flights (styled as boarding-pass cards)
- View a flight's seat map, grouped by row with an aisle, showing live availability
- Select one or more seats and enter a passenger name for each
- See a price breakdown (seat cost + service fee + platform fee) before confirming
- Get a confirmation screen with the booking ID and status after a successful booking

## Tech stack

- React (Vite)
- React Router for navigation
- Plain CSS (no UI framework) — custom design system with CSS variables

## Getting started

### Prerequisites

The [backend API](https://github.com/<your-username>/ticket-booking) must be running first — this app has no functionality of its own without it.

### Setup

```bash
git clone https://github.com/<your-username>/ticket-booking-frontend.git
cd ticket-booking-frontend
npm install
```

Set the backend URL in `src/config.js`:
```js
export const API_URL = 'http://localhost:8080'
```

Run the dev server:
```bash
npm run dev
```

Opens at `http://localhost:5173`.

## Project structure

```
src/
├── pages/
│   ├── FlightList.jsx          # Home page: hero + boarding-pass flight cards
│   ├── FlightDetail.jsx        # Seat map, price summary, booking trigger
│   └── BookingConfirmation.jsx # Post-booking confirmation screen
├── components/
│   └── PassengerModal.jsx      # Passenger name entry, shown before submitting
├── config.js                   # Backend API URL (single source of truth)
└── index.css                   # Design system: colors, typography, all component styles
```

## Notes on scope

This app deliberately has no login or booking history — a booking's confirmation page is reachable by anyone with its URL, but there's no way to look up "my past bookings" without an account. That's a conscious scope decision to keep the project focused on the booking flow itself, matching the backend's scope (see the [backend README](https://github.com/<your-username>/ticket-booking) for more on that).
