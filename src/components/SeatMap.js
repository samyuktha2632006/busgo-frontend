import React from 'react';

export default function SeatMap({ bus, selectedSeats, onToggle, paxCount }) {
  if (!bus) return null;
  const seats = [];
  for (let i = 1; i <= bus.totalSeats; i++) {
    const isBooked   = bus.bookedSeats.includes(i);
    const isLadies   = bus.ladiesSeats.includes(i);
    const isSelected = selectedSeats.includes(i);
    let cls = isBooked ? 'booked' : isSelected ? 'selected' : isLadies ? 'ladies' : 'avail';

    // Insert aisle gap after every 2nd seat in a row (col index 1 → add gap before col 2)
    const colIndex = (i - 1) % 4;
    const rowIndex = Math.floor((i - 1) / 4);

    seats.push(
      <React.Fragment key={i}>
        {colIndex === 2 && <div className="seat-gap"/>}
        <div
          className={`seat ${cls}`}
          onClick={() => !isBooked && onToggle(i)}
        >
          {i}
        </div>
      </React.Fragment>
    );
  }

  const total = selectedSeats.length * (bus.fare || 0);

  return (
    <div className="seat-wrap">
      <div className="seat-legend">
        <div className="leg-item"><div className="leg-box leg-avail"/><span>Available</span></div>
        <div className="leg-item"><div className="leg-box leg-booked"/><span>Booked</span></div>
        <div className="leg-item"><div className="leg-box leg-sel"/><span>Selected</span></div>
        <div className="leg-item"><div className="leg-box leg-ladies"/><span>Ladies</span></div>
      </div>
      <div className="seat-layout">
        <div>
          <div className="driver-box">Driver</div>
          <div className="seat-grid">{seats}</div>
        </div>
        <div className="sel-summary">
          <div className="sel-summary-title">Selected seats</div>
          <div className="sel-seats-txt">
            {selectedSeats.length ? 'Seat ' + [...selectedSeats].sort((a,b)=>a-b).join(', ') : 'None'}
          </div>
          <div className="sel-price-txt">₹{total.toLocaleString('en-IN')}</div>
          {selectedSeats.length < paxCount && (
            <div className="sel-req-txt">Select {paxCount - selectedSeats.length} more seat(s)</div>
          )}
        </div>
      </div>
    </div>
  );
}
