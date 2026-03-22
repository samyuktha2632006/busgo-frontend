import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bookingAPI } from '../services/api';
import Navbar from '../components/Navbar';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

export default function Bookings() {
  const { user }      = useAuth();
  const { showToast } = useToast();
  const navigate      = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await bookingAPI.myBookings();
      setBookings(data.bookings);
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally { setLoading(false); }
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingAPI.cancel(id);
      showToast('Booking cancelled. Refund initiated.', 'success');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  return (
    <>
      <Navbar onOpenAuth={()=>{}}/>
      <div className="page-wrap">
        <div className="page-heading">My Bookings</div>
        {loading && <p style={{color:'#888'}}>Loading...</p>}
        {!loading && bookings.length === 0 && (
          <p style={{color:'#888'}}>No bookings yet. <span style={{color:'#E8541A',cursor:'pointer'}} onClick={()=>navigate('/')}>Search buses →</span></p>
        )}
        {bookings.map(b => (
          <div className="booking-item" key={b._id}>
            <div>
              <div className="bi-route">{b.bus?.from} → {b.bus?.to}</div>
              <div className="bi-detail">{b.bus?.name} · {formatDate(b.travelDate)} · Seats: {b.seats?.sort((a,c)=>a-c).join(', ')}</div>
              <div className="bi-detail" style={{marginTop:'2px'}}>ID: {b.bookingId}</div>
              {b.status === 'Confirmed' && (
                <button className="cancel-booking-btn" onClick={()=>cancel(b._id)}>Cancel booking</button>
              )}
            </div>
            <div>
              <div className="bi-fare">₹{b.totalFare?.toLocaleString('en-IN')}</div>
              <div className="bi-id">
                <span className={`bi-status bi-${b.status.toLowerCase()}`}>{b.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <footer>
        <p>© 2026 BusGo. All rights reserved.</p>
        <div className="footer-links"><a href="#">Privacy</a><a href="#">Terms</a></div>
      </footer>
    </>
  );
}
