import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useBooking } from '../context/BookingContext';
import { busAPI } from '../services/api';
import Navbar from '../components/Navbar';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}
function getDuration(dep, arr) {
  const [dh,dm] = dep.split(':').map(Number);
  const [ah,am] = arr.split(':').map(Number);
  let m = (ah*60+am)-(dh*60+dm);
  if (m < 0) m += 1440;
  return `${Math.floor(m/60)}h ${m%60}m`;
}

export default function SearchResults() {
  const { user }                                  = useAuth();
  const { showToast }                             = useToast();
  const { setSelectedBus, setSearchParams: setSP } = useBooking();
  const navigate                                  = useNavigate();
  const [urlParams]                               = useSearchParams();

  const from     = urlParams.get('from') || '';
  const to       = urlParams.get('to')   || '';
  const date     = urlParams.get('date') || '';
  const paxCount = parseInt(urlParams.get('pax')) || 1;

  const [buses,   setBuses]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort,    setSort]    = useState('departure');

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    setSP({ from, to, date, paxCount });
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const { data } = await busAPI.search(from, to, date);
      setBuses(data.buses);
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally { setLoading(false); }
  };

  const sortedBuses = [...buses].sort((a, b) => {
    if (sort === 'fare')      return a.fare - b.fare;
    if (sort === 'seats')     return b.availableSeats - a.availableSeats;
    if (sort === 'departure') return a.departureTime.localeCompare(b.departureTime);
    return 0;
  });

  const selectBus = (bus) => {
    setSelectedBus(bus);
    navigate('/seats');
  };

  return (
    <>
      <Navbar/>
      {/* Search summary bar */}
      <div style={{ background:'#1A1208', padding:'1rem 2.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, color:'#fff', fontSize:'1.05rem' }}>{from} → {to}</span>
          <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.85rem' }}>{formatDate(date)} · {paxCount} passenger{paxCount>1?'s':''}</span>
        </div>
        <button style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.7)', padding:'0.4rem 1rem', borderRadius:'50px', fontSize:'0.83rem', cursor:'pointer' }}
          onClick={() => navigate('/')}>
          ← Modify search
        </button>
      </div>

      <div style={{ padding:'1.5rem 2.5rem', maxWidth:'900px', margin:'0 auto' }}>
        {/* Sort bar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
          <div style={{ fontSize:'0.9rem', color:'#888' }}>
            {loading ? 'Searching...' : `${buses.length} bus${buses.length!==1?'es':''} found`}
          </div>
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            <span style={{ fontSize:'0.8rem', color:'#888' }}>Sort by:</span>
            {['departure','fare','seats'].map(s=>(
              <button key={s} onClick={()=>setSort(s)}
                style={{ border:'1px solid', borderColor: sort===s?'#E8541A':'#ddd', borderRadius:'50px', padding:'3px 12px', fontSize:'0.8rem', background: sort===s?'#E8541A':'transparent', color: sort===s?'#fff':'#888', cursor:'pointer' }}>
                {s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div style={{ textAlign:'center', padding:'3rem' }}>
            <div className="spinner" style={{ margin:'0 auto' }}/>
            <p style={{ color:'#888', marginTop:'1rem', fontSize:'0.9rem' }}>Finding the best buses for you...</p>
          </div>
        )}

        {!loading && buses.length === 0 && (
          <div style={{ textAlign:'center', padding:'3rem', background:'#fff', borderRadius:'12px', border:'1px solid #eee' }}>
            <div style={{ fontSize:'2rem', marginBottom:'0.8rem' }}>🚌</div>
            <div style={{ fontWeight:500, marginBottom:'0.4rem' }}>No buses found</div>
            <p style={{ color:'#888', fontSize:'0.88rem' }}>Try a different date or route.</p>
            <button style={{ marginTop:'1rem', background:'#E8541A', color:'#fff', border:'none', borderRadius:'8px', padding:'0.6rem 1.4rem', cursor:'pointer' }}
              onClick={() => navigate('/')}>Search again</button>
          </div>
        )}

        {!loading && sortedBuses.map(bus => (
          <div className="bus-card" key={bus._id}
            style={{ background:'#fff', borderRadius:'14px', padding:'1.2rem 1.4rem', marginBottom:'1rem', border:'1.5px solid #eee', display:'grid', gridTemplateColumns:'1fr auto', gap:'1rem', alignItems:'center', transition:'border-color 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(232,84,26,0.35)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='#eee'}>
            <div>
              <div style={{ fontWeight:500, fontSize:'1rem', marginBottom:'2px' }}>
                {bus.name}
                <span style={{ display:'inline-block', fontSize:'11px', padding:'2px 8px', borderRadius:'50px', background:'#EAF3DE', color:'#27500A', marginLeft:'8px', fontWeight:500 }}>{bus.busType}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', margin:'6px 0' }}>
                <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'1.1rem' }}>{bus.departureTime}</span>
                <span style={{ color:'#ccc' }}>→</span>
                <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'1.1rem' }}>{bus.arrivalTime}</span>
                <span style={{ fontSize:'0.75rem', color:'#888', background:'#f5f5f5', padding:'2px 8px', borderRadius:'50px' }}>{getDuration(bus.departureTime, bus.arrivalTime)}</span>
              </div>
              <div style={{ fontSize:'0.8rem', color:'#888' }}>
                {bus.availableSeats} seats available · Bus no: {bus.busNumber}
              </div>
              <div style={{ display:'flex', gap:'8px', marginTop:'8px' }}>
                {bus.ladiesSeats?.length > 0 && <span style={{ fontSize:'11px', color:'#72243E', background:'#FBEAF0', padding:'2px 8px', borderRadius:'50px' }}>Ladies seats available</span>}
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'1.2rem', color:'#E8541A' }}>
                ₹{bus.fare.toLocaleString('en-IN')}
                <span style={{ fontSize:'0.72rem', color:'#888', fontWeight:400 }}> /seat</span>
              </div>
              <div style={{ fontSize:'0.75rem', color:'#888', marginTop:'2px' }}>{bus.availableSeats} left</div>
              <button style={{ marginTop:'10px', background:'#E8541A', color:'#fff', border:'none', borderRadius:'8px', padding:'0.5rem 1.2rem', fontWeight:600, fontSize:'0.85rem', cursor:'pointer' }}
                onClick={() => selectBus(bus)}>
                Select seats →
              </button>
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
