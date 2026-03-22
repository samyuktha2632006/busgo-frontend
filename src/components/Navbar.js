import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useBooking } from '../context/BookingContext';

const STEPS = [
  { path: '/search',     label: 'Search results' },
  { path: '/seats',      label: 'Select seats' },
  { path: '/passengers', label: 'Passenger info' },
  { path: '/ticket',     label: 'Ticket' },
];

export default function Navbar({ onOpenAuth }) {
  const { user, logout }     = useAuth();
  const { showToast }        = useToast();
  const { resetBooking }     = useBooking();
  const navigate             = useNavigate();
  const location             = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const bookingStep = STEPS.findIndex(s => location.pathname === s.path);
  const inBookingFlow = bookingStep >= 0;

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = () => {
    logout(); resetBooking();
    setMenuOpen(false);
    showToast('Logged out successfully.');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo" onClick={resetBooking}>Bus<span>Go</span></Link>

      {/* booking step bar in nav when in booking flow */}
      {inBookingFlow ? (
        <div style={{ display:'flex', alignItems:'center', gap:0 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.path}>
              <div className={`step-pill ${i < bookingStep ? 'done' : i === bookingStep ? 'active' : ''}`}
                style={{ fontSize:'0.78rem', padding:'0 4px' }}>
                <div className="step-num">{i + 1}</div>
                <span style={{ display: window.innerWidth < 600 ? 'none' : 'inline' }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`step-line ${i < bookingStep ? 'done' : ''}`} style={{ width: 30 }}/>}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          {user && <li><Link to="/bookings">My Bookings</Link></li>}
          <li><a href="#">Help</a></li>
        </ul>
      )}

      <div className="nav-right" ref={menuRef}>
        {!user ? (
          <div style={{ display:'flex', gap:'8px' }}>
            <button className="nav-btn" onClick={() => onOpenAuth && onOpenAuth('login')}>Sign in</button>
            <button className="nav-btn primary" onClick={() => onOpenAuth && onOpenAuth('register')}>Register</button>
          </div>
        ) : (
          <>
            <div className="user-pill" onClick={() => setMenuOpen(o => !o)}>
              <div className="user-av">{user.name.charAt(0).toUpperCase()}</div>
              <span className="user-name-txt">{user.name.split(' ')[0]}</span>
              <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.7rem' }}>▼</span>
            </div>
            {menuOpen && (
              <div className="user-menu">
                <div className="um-item" onClick={() => { navigate('/bookings'); setMenuOpen(false); }}>My bookings</div>
                {user.role === 'admin' && (
                  <div className="um-item" onClick={() => { navigate('/admin'); setMenuOpen(false); }}>Admin panel</div>
                )}
                <hr className="um-divider"/>
                <div className="um-item danger" onClick={handleLogout}>Log out</div>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
