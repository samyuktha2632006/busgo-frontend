import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import Navbar from '../components/Navbar';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

export default function Ticket() {
  const { user }                          = useAuth();
  const { confirmedBooking, resetBooking } = useBooking();
  const navigate                          = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    if (!confirmedBooking) { navigate('/'); return; }
  }, []);

  if (!confirmedBooking) return null;

  const b   = confirmedBooking;
  const bus = b.bus;

  return (
    <>
      <Navbar/>

      <div style={{ maxWidth:'560px', margin:'2rem auto', padding:'0 1.5rem' }}>

        {/* Success header */}
        <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
          <div style={{ width:'56px', height:'56px', background:'#EAF3DE', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 0.8rem', fontSize:'1.5rem' }}>✓</div>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'1.3rem', marginBottom:'0.3rem' }}>Booking confirmed!</div>
          <div style={{ color:'#888', fontSize:'0.88rem' }}>Your e-ticket is ready. Show this to the driver.</div>
        </div>

        {/* Ticket */}
        <div className="ticket">
          <div className="ticket-head">
            <div>
              <div className="ticket-logo">Bus<span>Go</span></div>
              <div className="ticket-id">Booking ID: {b.bookingId}</div>
            </div>
            <div className="ticket-confirmed">Confirmed</div>
          </div>

          <div className="ticket-route">{bus.from} → {bus.to}</div>
          <div className="ticket-bus">{bus.name} · {bus.busType}</div>

          <div className="ticket-grid">
            <div><div className="ticket-key">Date</div><div className="ticket-val">{formatDate(b.travelDate)}</div></div>
            <div><div className="ticket-key">Departure</div><div className="ticket-val">{bus.departureTime}</div></div>
            <div><div className="ticket-key">Arrival</div><div className="ticket-val">{bus.arrivalTime}</div></div>
            <div><div className="ticket-key">Seats</div><div className="ticket-val">{b.seats.sort((a,c)=>a-c).join(', ')}</div></div>
          </div>

          <div style={{ marginBottom:'0.8rem' }}>
            <div className="ticket-pax-title">Passengers</div>
            {b.passengers.map((p,i)=>(
              <div className="ticket-pax-row" key={i}>
                <span>{p.name} ({p.gender}, {p.age})</span>
                <span style={{ color:'#888' }}>Seat {p.seatNumber}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize:'0.78rem', color:'#888', marginBottom:'0.6rem' }}>
            Contact: {b.contactPhone} · {b.contactEmail}
          </div>

          <div className="ticket-foot">
            <div>
              <div className="ticket-total-label">Total paid</div>
              <div className="ticket-total">₹{b.totalFare.toLocaleString('en-IN')}</div>
            </div>
            <button className="print-btn" onClick={() => window.print()}>Print ticket</button>
          </div>

          <div className="ticket-note">Valid for selected date only. Arrive 15 mins before departure.</div>
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:'10px', marginTop:'1.2rem' }}>
          <button style={{ flex:1, background:'#fff', border:'1.5px solid #eee', borderRadius:'10px', padding:'0.75rem', fontWeight:500, fontSize:'0.88rem', cursor:'pointer' }}
            onClick={() => { navigate('/bookings'); }}>
            My bookings
          </button>
          <button style={{ flex:1, background:'#E8541A', color:'#fff', border:'none', borderRadius:'10px', padding:'0.75rem', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'0.88rem', cursor:'pointer' }}
            onClick={() => { resetBooking(); navigate('/'); }}>
            Book another bus
          </button>
        </div>
      </div>

      <footer>
        <p>© 2026 BusGo. All rights reserved.</p>
        <div className="footer-links"><a href="#">Privacy</a><a href="#">Terms</a></div>
      </footer>
    </>
  );
}
