import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function AuthDropdown({ tab, onClose }) {
  const [activeTab, setActiveTab] = useState(tab || 'login');
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);
  const { login, register } = useAuth();
  const { showToast }       = useToast();
  const navigate            = useNavigate();
  const ref = useRef(null);

  useEffect(() => { setActiveTab(tab); }, [tab]);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  // Login form state
  const [lEmail, setLEmail] = useState('');
  const [lPass,  setLPass]  = useState('');

  // Register form state
  const [rName,  setRName]  = useState('');
  const [rEmail, setREmail] = useState('');
  const [rPhone, setRPhone] = useState('');
  const [rPass,  setRPass]  = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr('');
    if (!lEmail || !lPass) { setErr('Please fill in all fields.'); return; }
    setBusy(true);
    try {
      const u = await login(lEmail, lPass);
      showToast(`Welcome back, ${u.name.split(' ')[0]}!`, 'success');
      onClose();
      if (u.role === 'admin') navigate('/admin');
    } catch (er) {
      setErr(er.response?.data?.message || er.message);
    } finally { setBusy(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErr('');
    if (!rName || !rEmail || !rPhone || !rPass) { setErr('Please fill in all fields.'); return; }
    setBusy(true);
    try {
      const u = await register(rName, rEmail, rPhone, rPass);
      showToast(`Welcome, ${u.name.split(' ')[0]}!`, 'success');
      onClose();
    } catch (er) {
      setErr(er.response?.data?.message || er.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="auth-dropdown open" ref={ref}>
      <div className="dd-tabs">
        <button className={`dd-tab ${activeTab==='login'?'active':''}`} onClick={() => { setActiveTab('login'); setErr(''); }}>Sign in</button>
        <button className={`dd-tab ${activeTab==='register'?'active':''}`} onClick={() => { setActiveTab('register'); setErr(''); }}>Register</button>
      </div>
      <div className="dd-body">
        {err && <div className="auth-err">{err}</div>}

        {activeTab === 'login' && (
          <form className="dd-form active" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@email.com" value={lEmail} onChange={e=>setLEmail(e.target.value)} required/>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={lPass} onChange={e=>setLPass(e.target.value)} required/>
            </div>
            <button type="submit" className="submit-btn" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
            <div className="dd-foot">No account? <a onClick={() => setActiveTab('register')}>Register free</a></div>
          </form>
        )}

        {activeTab === 'register' && (
          <form className="dd-form active" onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full name</label>
              <input type="text" placeholder="Your name" value={rName} onChange={e=>setRName(e.target.value)} required/>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@email.com" value={rEmail} onChange={e=>setREmail(e.target.value)} required/>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" placeholder="9876543210" value={rPhone} onChange={e=>setRPhone(e.target.value)} required/>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Min 6 characters" value={rPass} onChange={e=>setRPass(e.target.value)} required/>
            </div>
            <button type="submit" className="submit-btn" disabled={busy}>{busy ? 'Creating...' : 'Create account'}</button>
            <div className="dd-foot">Have an account? <a onClick={() => setActiveTab('login')}>Sign in</a></div>
          </form>
        )}
      </div>
    </div>
  );
}
