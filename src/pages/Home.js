import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useBooking } from '../context/BookingContext';
import Navbar from '../components/Navbar';
import AuthDropdown from '../components/AuthDropdown';

const POPULAR_ROUTES = [
  { from:'Chennai',    to:'Coimbatore', dur:'7h 30m', price:'₹450', tag:'Popular' },
  { from:'Coimbatore', to:'Bangalore',  dur:'5h',     price:'₹380', tag:'Popular' },
  { from:'Hyderabad',  to:'Chennai',    dur:'9h',     price:'₹620', tag:'AC'      },
  { from:'Bengaluru',  to:'Mumbai',     dur:'16h',    price:'₹890', tag:'Sleeper' },
  { from:'Pune',       to:'Goa',        dur:'8h',     price:'₹540', tag:'Scenic'  },
  { from:'Delhi',      to:'Jaipur',     dur:'5h 30m', price:'₹320', tag:'Express' },
  { from:'Mysuru',     to:'Chennai',    dur:'7h',     price:'₹490', tag:'AC'      },
  { from:'Kochi',      to:'Coimbatore', dur:'4h 30m', price:'₹350', tag:'Popular' },
];

const FEATURES = [
  { icon:'🛡️', title:'Secure payments',   desc:'UPI, cards, net banking — all encrypted.' },
  { icon:'📍', title:'Live tracking',      desc:'Know exactly where your bus is, in real time.' },
  { icon:'🎟️', title:'Instant e-ticket',  desc:'Your ticket arrives immediately after booking.' },
  { icon:'↩️', title:'Easy cancellation', desc:'Cancel up to 2 hours before departure.' },
];

export default function Home() {
  const { user }           = useAuth();
  const { showToast }      = useToast();
  const { setSearchParams } = useBooking();
  const navigate           = useNavigate();

  const [authTab,   setAuthTab]  = useState(null);
  const [from,      setFrom]     = useState('');
  const [to,        setTo]       = useState('');
  const [date,      setDate]     = useState(new Date().toISOString().split('T')[0]);
  const [paxCount,  setPaxCount] = useState(1);
  const [showLock,  setShowLock] = useState(false);
  const [tripType,  setTripType] = useState('one-way');

  const swap = () => { setFrom(to); setTo(from); };

  const handleSearch = () => {
    if (!user) {
      setShowLock(true);
      setAuthTab('login');
      setTimeout(() => setShowLock(false), 4000);
      return;
    }
    if (!from || !to || !date) {
      showToast('Please fill in all search fields.', 'error');
      return;
    }
    // Save params in context then navigate to search results page
    setSearchParams({ from, to, date, paxCount });
    navigate(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&pax=${paxCount}`);
  };

  const quickSearch = (f, t) => {
    if (!user) { setAuthTab('login'); return; }
    setFrom(f); setTo(t);
    setSearchParams({ from: f, to: t, date, paxCount });
    navigate(`/search?from=${encodeURIComponent(f)}&to=${encodeURIComponent(t)}&date=${date}&pax=${paxCount}`);
  };

  return (
    <>
      <div style={{ position:'relative' }}>
        <Navbar onOpenAuth={setAuthTab}/>
        {authTab && (
          <div style={{ position:'fixed', top:62, right:0, zIndex:700 }}>
            <AuthDropdown tab={authTab} onClose={() => setAuthTab(null)}/>
          </div>
        )}
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-tag">Book in under 60 seconds</div>
        <h1>Travel anywhere,<br/><em>any time.</em></h1>
        <p>Thousands of routes. Hundreds of operators. One simple platform built for India.</p>

        <div className="booking-card">
          <div className="trip-toggle">
            <button className={tripType==='one-way'?'active':''} onClick={()=>setTripType('one-way')}>One way</button>
            <button className={tripType==='round-trip'?'active':''} onClick={()=>setTripType('round-trip')}>Round trip</button>
          </div>
          <div className="fields-row">
            <div className="field-group">
              <div className="field-label">From</div>
              <input className="field-input" placeholder="Chennai" value={from} onChange={e=>setFrom(e.target.value)}/>
            </div>
            <button className="swap-btn" onClick={swap}>⇄</button>
            <div className="field-group">
              <div className="field-label">To</div>
              <input className="field-input" placeholder="Coimbatore" value={to} onChange={e=>setTo(e.target.value)}/>
            </div>
            <div className="field-group">
              <div className="field-label">Date</div>
              <input className="field-input" type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={e=>setDate(e.target.value)}/>
            </div>
            <div className="field-group">
              <div className="field-label">Passengers</div>
              <select className="field-input" value={paxCount} onChange={e=>setPaxCount(Number(e.target.value))}>
                {[1,2,3,4].map(n=><option key={n} value={n}>{n} Passenger{n>1?'s':''}</option>)}
              </select>
            </div>
          </div>
          <div className="search-actions">
            {showLock && (
              <div className="lock-hint">
                🔒 Please <a onClick={()=>setAuthTab('login')}>sign in</a> to search buses
              </div>
            )}
            <div style={{flex:1}}/>
            <button className="search-btn" onClick={handleSearch}>Search buses →</button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-strip">
        {[['2,400+','Routes across India'],['180+','Bus operators'],['4.8★','Average rating'],['50L+','Tickets booked']].map(([n,l])=>(
          <div className="stat-item" key={l}><div className="stat-num">{n}</div><div className="stat-lbl">{l}</div></div>
        ))}
      </div>

      {/* POPULAR ROUTES */}
      <section className="section">
        <div className="section-header">
          <div className="section-title">Popular routes</div>
        </div>
        <div className="routes-grid">
          {POPULAR_ROUTES.map((r,i)=>(
            <div className="route-card" key={i} onClick={()=>quickSearch(r.from,r.to)}>
              <div className="route-cities">{r.from} → {r.to}</div>
              <div className="route-meta">{r.dur} · {r.tag}</div>
              <div className="route-price">{r.price}</div>
              {!user && <div className="route-lock">Sign in to book</div>}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div className="section-title">Why BusGo?</div>
        <div className="features-grid">
          {FEATURES.map((f,i)=>(
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <p>© 2026 BusGo. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Contact</a>
        </div>
      </footer>
    </>
  );
}
