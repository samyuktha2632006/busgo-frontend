# BusGo React — Separate Pages Version

Each booking step is now a separate page with its own URL.

## Pages & Routes

| Route          | Page                | Description                         |
|----------------|---------------------|-------------------------------------|
| `/`            | Home                | Search form + popular routes        |
| `/search`      | Search Results      | Available buses list with sorting   |
| `/seats`       | Seat Selection      | Interactive seat map                |
| `/passengers`  | Passenger Details   | Passenger + contact info form       |
| `/ticket`      | Ticket              | Confirmed e-ticket + print          |
| `/bookings`    | My Bookings         | User's booking history + cancel     |
| `/admin`       | Admin Panel         | Dashboard, buses, users, bookings   |

## How state passes between pages

Booking data flows through `BookingContext`:
- Home sets `searchParams` → navigates to `/search?from=&to=&date=&pax=`
- SearchResults sets `selectedBus` → navigates to `/seats`
- SeatSelection sets `selectedSeats` → navigates to `/passengers`
- PassengerDetails calls API → sets `confirmedBooking` → navigates to `/ticket`
- Ticket shows confirmed booking

## Setup

```bash
npm install
npm start
```

Backend must be running on `http://localhost:5000`.

## Test accounts
- Admin: admin@busgo.in / admin123
- User:  demo@busgo.in  / demo123
