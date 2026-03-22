import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useBooking } from '../context/BookingContext';
import Navbar from '../components/Navbar';
import SeatMap from '../components/SeatMap';

export default function SeatSelection() {
  const { user }                                               = useAuth();
  const { showToast }                                          = useToast();
  const { selectedBus, selectedSeats, setSelectedSeats,
          searchParams }                                        = useBooking();
  const navigate                                               = useNavigate();

  const paxCount = searchParams?.paxCount || 1;

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    if (!selectedBus) { navigate('/'); return; }
    setSelectedSeats([]);
  }, []);

  const toggleSeat = (n) => {
    setSelectedSeats(prev => {
      if (prev.includes(n)) return prev.filter(s => s !== n);
      if (prev.length >= paxCount) return [...prev.slice(1), n];
      return [...prev, n];
    });
  };

  const proceed = () => {
    if (selectedSeats.length < paxCount) {
      showToast(`Please select ${paxCount} seat(s).`, 'error');
      return;
    }
    navigate('/passengers');
  };

  if (!selectedBus) return null;

  return (
    <>
      <Navbar/>

      {/* Bus info header */}
      <div style={{ background:'#1A1208', padding:'1rem 2.5rem', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, color:'#fff', fontSize:'1.05rem' }}>
              {selectedBus.from} → {selectedBus.to}
            </div>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.83rem', marginTop:'3px' }}>
              {selectedBus.name} · {selectedBus.busType} · Dep {selectedBus.departureTime} → Arr {selectedBus.arrivalTime}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, color:'#E8541A', fontSize:'1.1rem' }}>
              ₹{selectedBus.fare.toLocaleString('en-IN')}<span style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.4)', fontWeight:400 }}>/seat</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:'900px', margin:'1.5rem auto', padding:'0 2.5rem' }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'1rem', marginBottom:'1rem' }}>
          Select {paxCount} seat{paxCount>1?'s':''}
        </div>

        <SeatMap
          bus={selectedBus}
          selectedSeats={selectedSeats}
          onToggle={toggleSeat}
          paxCount={paxCount}
        />

        <div className="action-row">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back to results</button>
          <button className="next-btn" onClick={proceed}
            disabled={selectedSeats.length < paxCount}
            style={{ opacity: selectedSeats.length < paxCount ? 0.5 : 1 }}>
            Continue to passenger info →
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
