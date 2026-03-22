import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useBooking } from '../context/BookingContext';
import { bookingAPI } from '../services/api';
import Navbar from '../components/Navbar';

export default function PassengerDetails() {
  const { user }                                                           = useAuth();
  const { showToast }                                                      = useToast();
  const { selectedBus, selectedSeats, searchParams,
          passengers, setPassengers,
          contactInfo, setContactInfo,
          setConfirmedBooking }                                             = useBooking();
  const navigate                                                           = useNavigate();
  const [loading, setLoading] = useState(false);

  const sortedSeats = [...selectedSeats].sort((a,b)=>a-b);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    if (!selectedBus || selectedSeats.length === 0) { navigate('/'); return; }
    // Init passenger forms
    setPassengers(sortedSeats.map((s, i) => ({
      seat:    s,
      name:    passengers[i]?.name    || '',
      age:     passengers[i]?.age     || '',
      gender:  passengers[i]?.gender  || 'Male',
      idType:  passengers[i]?.idType  || 'Aadhaar',
    })));
  }, []);

  const updatePax = (i, field, val) => {
    setPassengers(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  };

  const confirm = async () => {
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].name.trim()) {
        showToast(`Enter name for passenger ${i + 1}`, 'error'); return;
      }
    }
    if (!contactInfo.phone || !contactInfo.email) {
      showToast('Please enter contact details.', 'error'); return;
    }

    setLoading(true);
    try {
      const { data } = await bookingAPI.create({
        busId:        selectedBus._id,
        travelDate:   searchParams.date,
        seats:        sortedSeats,
        passengers:   passengers.map(p => ({
          name:       p.name.trim(),
          age:        parseInt(p.age) || 0,
          gender:     p.gender,
          idType:     p.idType,
          seatNumber: p.seat,
        })),
        contactPhone: contactInfo.phone,
        contactEmail: contactInfo.email,
      });
      setConfirmedBooking(data.booking);
      navigate('/ticket');
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally { setLoading(false); }
  };

  return (
    <>
      {loading && <div className="loader-overlay"><div className="spinner"/></div>}
      <Navbar/>

      {/* Summary strip */}
      <div style={{ background:'#1A1208', padding:'1rem 2.5rem' }}>
        <div style={{ maxWidth:'700px', margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, color:'#fff' }}>{selectedBus?.from} → {selectedBus?.to}</div>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.82rem', marginTop:'2px' }}>
              {selectedBus?.name} · Seats: {sortedSeats.join(', ')}
            </div>
          </div>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, color:'#E8541A', fontSize:'1.1rem' }}>
            ₹{(sortedSeats.length * (selectedBus?.fare||0)).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:'700px', margin:'1.5rem auto', padding:'0 2.5rem' }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'1rem', marginBottom:'1rem' }}>
          Passenger details
        </div>

        {passengers.map((p, i) => (
          <div className="pax-card" key={i}>
            <div className="pax-card-title">Passenger {i+1} — Seat {p.seat}</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Full name</label>
                <input placeholder="Enter full name" value={p.name} onChange={e=>updatePax(i,'name',e.target.value)}/>
              </div>
              <div className="form-group">
                <label>Age</label>
                <input type="number" placeholder="25" min="1" max="99" value={p.age} onChange={e=>updatePax(i,'age',e.target.value)}/>
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select value={p.gender} onChange={e=>updatePax(i,'gender',e.target.value)}>
                  {['Male','Female','Other'].map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>ID type</label>
                <select value={p.idType} onChange={e=>updatePax(i,'idType',e.target.value)}>
                  {['Aadhaar','PAN','Passport','Driving Licence'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        ))}

        {/* Contact */}
        <div className="contact-box">
          <div className="contact-box-title">Contact details</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" placeholder="9876543210"
                value={contactInfo.phone}
                onChange={e=>setContactInfo(c=>({...c,phone:e.target.value}))}/>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@email.com"
                value={contactInfo.email}
                onChange={e=>setContactInfo(c=>({...c,email:e.target.value}))}/>
            </div>
          </div>
        </div>

        {/* Fare summary */}
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'1rem 1.2rem', marginTop:'1rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:'0.8rem', color:'#888' }}>{sortedSeats.length} seat{sortedSeats.length>1?'s':''} × ₹{selectedBus?.fare}</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'1.2rem', color:'#E8541A', marginTop:'2px' }}>
              Total: ₹{(sortedSeats.length*(selectedBus?.fare||0)).toLocaleString('en-IN')}
            </div>
          </div>
          <div style={{ fontSize:'0.78rem', color:'#888', textAlign:'right' }}>
            <div>Seats: {sortedSeats.join(', ')}</div>
            <div style={{ marginTop:'2px' }}>{selectedBus?.departureTime} → {selectedBus?.arrivalTime}</div>
          </div>
        </div>

        <div className="action-row">
          <button className="back-btn" onClick={()=>navigate('/seats')}>← Back to seats</button>
          <button className="next-btn" onClick={confirm}>Confirm & Book →</button>
        </div>
      </div>

      <footer>
        <p>© 2026 BusGo. All rights reserved.</p>
        <div className="footer-links"><a href="#">Privacy</a><a href="#">Terms</a></div>
      </footer>
    </>
  );
}
