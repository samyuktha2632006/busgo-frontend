import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminAPI, busAPI, bookingAPI } from '../services/api';

function formatDate(d) { return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); }
function formatMoney(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

const EMPTY_BUS = { name:'', busNumber:'', busType:'AC Sleeper', from:'', to:'', departureTime:'22:00', arrivalTime:'05:30', totalSeats:'', fare:'', status:'Active' };

export default function Admin() {
  const { user, logout } = useAuth();
  const { showToast }    = useToast();
  const navigate         = useNavigate();

  const [page,    setPage]    = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [search,  setSearch]  = useState('');

  // Dashboard
  const [stats,     setStats]     = useState(null);
  const [recentB,   setRecentB]   = useState([]);
  const [recentU,   setRecentU]   = useState([]);

  // Buses
  const [buses,     setBuses]     = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [busForm,   setBusForm]   = useState(EMPTY_BUS);

  // Users
  const [users,     setUsers]     = useState([]);

  // Bookings
  const [bookings,  setBookings]  = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    loadDashboard();
  }, [user]);

  const load = (name) => {
    setPage(name); setSearch('');
    if (name==='dashboard') loadDashboard();
    if (name==='buses')     loadBuses();
    if (name==='users')     loadUsers();
    if (name==='bookings')  loadBookings();
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.dashboard();
      setStats(data.stats); setRecentB(data.recentBookings); setRecentU(data.recentUsers);
    } catch (err) { showToast(err.response?.data?.message||err.message,'error'); }
    finally { setLoading(false); }
  };
  const loadBuses    = async () => { try { const {data}=await busAPI.getAll(); setBuses(data.buses); } catch(e){} };
  const loadUsers    = async () => { try { const {data}=await adminAPI.users(); setUsers(data.users); } catch(e){} };
  const loadBookings = async () => { try { const {data}=await bookingAPI.all(); setBookings(data.bookings); } catch(e){} };

  const openModal = (bus=null) => {
    setEditId(bus?bus._id:null);
    setBusForm(bus ? { name:bus.name, busNumber:bus.busNumber, busType:bus.busType, from:bus.from, to:bus.to, departureTime:bus.departureTime, arrivalTime:bus.arrivalTime, totalSeats:bus.totalSeats, fare:bus.fare, status:bus.status } : EMPTY_BUS);
    setShowModal(true);
  };

  const saveBus = async () => {
    const payload = { ...busForm, totalSeats:parseInt(busForm.totalSeats), fare:parseInt(busForm.fare) };
    if (!payload.name||!payload.busNumber||!payload.from||!payload.to) { showToast('Fill all fields.','error'); return; }
    setLoading(true);
    try {
      if (editId) await busAPI.update(editId,payload); else await busAPI.add(payload);
      setShowModal(false);
      showToast(editId?'Bus updated.':'Bus added.','success');
      loadBuses();
    } catch(err){ showToast(err.response?.data?.message||err.message,'error'); }
    finally { setLoading(false); }
  };

  const delBus = async (id) => {
    if(!window.confirm('Delete this bus?')) return;
    try { await busAPI.delete(id); showToast('Bus deleted.','success'); loadBuses(); } catch(e){}
  };

  const toggleBlock = async (id) => {
    try { await adminAPI.toggleBlock(id); showToast('User status updated.','success'); loadUsers(); } catch(e){}
  };

  const filteredBuses    = buses.filter(b=>b.name.toLowerCase().includes(search.toLowerCase())||b.busNumber.toLowerCase().includes(search.toLowerCase())||b.from.toLowerCase().includes(search.toLowerCase())||b.to.toLowerCase().includes(search.toLowerCase()));
  const filteredUsers    = users.filter(u=>u.name.toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase()));
  const filteredBookings = bookings.filter(b=>b.bookingId?.toLowerCase().includes(search.toLowerCase())||b.user?.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="admin-wrap">
      {loading && <div className="loader-overlay"><div className="spinner"/></div>}

      <aside className="sidebar">
        <div className="s-logo">Bus<span>Go</span> Admin</div>
        <nav className="s-nav">
          {[['dashboard','⊞','Dashboard'],['buses','🚌','Manage buses'],['users','👥','Users'],['bookings','🎟','Bookings']].map(([key,icon,label])=>(
            <div key={key} className={`ni ${page===key?'active':''}`} onClick={()=>load(key)}>{icon} {label}</div>
          ))}
        </nav>
        <div className="s-foot" onClick={()=>{logout();navigate('/');}}>← Logout</div>
      </aside>

      <div className="admin-main">
        <div className="a-topbar">
          <div className="a-topbar-title">{page.charAt(0).toUpperCase()+page.slice(1)}</div>
          <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
            <input className="search-bar-sm" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
            {page==='buses' && <button className="add-bus-btn" onClick={()=>openModal()}>+ Add bus</button>}
          </div>
        </div>

        <div className="a-content">

          {/* DASHBOARD */}
          {page==='dashboard' && stats && (
            <>
              <div className="stats-row">
                <div className="sc"><div className="sc-label">Total buses</div><div className="sc-val orange">{stats.totalBuses}</div></div>
                <div className="sc"><div className="sc-label">Total users</div><div className="sc-val">{stats.totalUsers}</div></div>
                <div className="sc"><div className="sc-label">Total bookings</div><div className="sc-val">{stats.totalBookings}</div></div>
                <div className="sc"><div className="sc-label">Revenue</div><div className="sc-val orange">{formatMoney(stats.totalRevenue)}</div></div>
              </div>
              <div className="a-panel">
                <div className="a-ph"><span className="a-ph-title">Recent bookings</span></div>
                <table className="a-table"><thead><tr><th>Booking ID</th><th>User</th><th>Route</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>{recentB.map(b=>(
                    <tr key={b._id}><td>{b.bookingId}</td><td>{b.user?.name||'—'}</td><td>{b.bus?.from}→{b.bus?.to}</td><td>{formatDate(b.travelDate)}</td><td>{formatMoney(b.totalFare)}</td>
                      <td><span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span></td></tr>
                  ))}</tbody>
                </table>
              </div>
              <div className="a-panel">
                <div className="a-ph"><span className="a-ph-title">Recent users</span></div>
                <table className="a-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th></tr></thead>
                  <tbody>{recentU.map(u=>(
                    <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.phone}</td><td>{formatDate(u.createdAt)}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            </>
          )}

          {/* BUSES */}
          {page==='buses' && (
            <div className="a-panel">
              <div className="a-ph"><span className="a-ph-title">All buses</span><span style={{fontSize:'0.78rem',color:'#888'}}>{filteredBuses.length} buses</span></div>
              {filteredBuses.length===0 ? <div className="empty-state">No buses found.</div> : (
                <table className="a-table"><thead><tr><th>Name</th><th>Number</th><th>Type</th><th>Route</th><th>Seats</th><th>Fare</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>{filteredBuses.map(b=>(
                    <tr key={b._id}>
                      <td>{b.name}</td><td>{b.busNumber}</td><td>{b.busType}</td>
                      <td>{b.from}→{b.to}</td><td>{b.totalSeats}</td><td>₹{b.fare}</td>
                      <td><span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span></td>
                      <td>
                        <button className="act-btn" onClick={()=>openModal(b)}>Edit</button>
                        <button className="act-btn danger" onClick={()=>delBus(b._id)}>Del</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          )}

          {/* USERS */}
          {page==='users' && (
            <>
              <div className="stats-row" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
                <div className="sc"><div className="sc-label">Total registered</div><div className="sc-val orange">{users.length}</div></div>
                <div className="sc"><div className="sc-label">Active</div><div className="sc-val">{users.filter(u=>!u.isBlocked).length}</div></div>
                <div className="sc"><div className="sc-label">Blocked</div><div className="sc-val">{users.filter(u=>u.isBlocked).length}</div></div>
              </div>
              <div className="a-panel">
                <div className="a-ph"><span className="a-ph-title">Registered users</span></div>
                <table className="a-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Logins</th><th>Status</th></tr></thead>
                  <tbody>{filteredUsers.map(u=>(
                    <tr key={u._id}>
                      <td><span className="avatar-sm">{u.name.charAt(0)}</span>{u.name}</td>
                      <td>{u.email}</td><td>{u.phone}</td><td>{formatDate(u.createdAt)}</td><td>{u.loginCount||0}</td>
                      <td>
                        <span className={`badge ${u.isBlocked?'badge-blocked':'badge-active'}`}>{u.isBlocked?'Blocked':'Active'}</span>
                        <button className={`act-btn ${u.isBlocked?'':'danger'}`} style={{marginLeft:'4px'}} onClick={()=>toggleBlock(u._id)}>
                          {u.isBlocked?'Unblock':'Block'}
                        </button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </>
          )}

          {/* BOOKINGS */}
          {page==='bookings' && (
            <div className="a-panel">
              <div className="a-ph"><span className="a-ph-title">All bookings</span></div>
              <table className="a-table"><thead><tr><th>Booking ID</th><th>User</th><th>Route</th><th>Date</th><th>Seats</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>{filteredBookings.map(b=>(
                  <tr key={b._id}>
                    <td>{b.bookingId}</td><td>{b.user?.name||'—'}</td><td>{b.bus?.from}→{b.bus?.to}</td>
                    <td>{formatDate(b.travelDate)}</td><td>{b.seats?.join(', ')}</td><td>{formatMoney(b.totalFare)}</td>
                    <td><span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* BUS MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target.classList.contains('modal-overlay')&&setShowModal(false)}>
          <div className="modal">
            <div className="m-head"><h2>{editId?'Edit bus':'Add new bus'}</h2><button className="m-close" onClick={()=>setShowModal(false)}>✕</button></div>
            <div className="m-body">
              <div className="m-grid">
                <div className="m-fg full"><label>Bus name</label><input value={busForm.name} onChange={e=>setBusForm({...busForm,name:e.target.value})} placeholder="KPN Travels"/></div>
                <div className="m-fg"><label>Bus number</label><input value={busForm.busNumber} onChange={e=>setBusForm({...busForm,busNumber:e.target.value})} placeholder="TN01AA9988"/></div>
                <div className="m-fg"><label>Type</label>
                  <select value={busForm.busType} onChange={e=>setBusForm({...busForm,busType:e.target.value})}>
                    {['AC Sleeper','Non-AC Sleeper','AC Seater','Non-AC Seater','Volvo AC','Express'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="m-fg"><label>From</label><input value={busForm.from} onChange={e=>setBusForm({...busForm,from:e.target.value})} placeholder="Chennai"/></div>
                <div className="m-fg"><label>To</label><input value={busForm.to} onChange={e=>setBusForm({...busForm,to:e.target.value})} placeholder="Coimbatore"/></div>
                <div className="m-fg"><label>Departure</label><input type="time" value={busForm.departureTime} onChange={e=>setBusForm({...busForm,departureTime:e.target.value})}/></div>
                <div className="m-fg"><label>Arrival</label><input type="time" value={busForm.arrivalTime} onChange={e=>setBusForm({...busForm,arrivalTime:e.target.value})}/></div>
                <div className="m-fg"><label>Total seats</label><input type="number" value={busForm.totalSeats} onChange={e=>setBusForm({...busForm,totalSeats:e.target.value})} placeholder="40"/></div>
                <div className="m-fg"><label>Fare (₹)</label><input type="number" value={busForm.fare} onChange={e=>setBusForm({...busForm,fare:e.target.value})} placeholder="650"/></div>
                <div className="m-fg"><label>Status</label>
                  <select value={busForm.status} onChange={e=>setBusForm({...busForm,status:e.target.value})}>
                    <option>Active</option><option>Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="m-foot">
              <button className="m-cancel" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="m-save" onClick={saveBus}>Save bus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
