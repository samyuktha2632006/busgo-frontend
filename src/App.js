import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }    from './context/AuthContext';
import { ToastProvider }   from './context/ToastContext';
import { BookingProvider } from './context/BookingContext';

import Home             from './pages/Home';
import SearchResults    from './pages/SearchResults';
import SeatSelection    from './pages/SeatSelection';
import PassengerDetails from './pages/PassengerDetails';
import Ticket           from './pages/Ticket';
import Bookings         from './pages/Bookings';
import Admin            from './pages/Admin';

import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <BookingProvider>
            <Routes>
              <Route path="/"           element={<Home/>}/>
              <Route path="/search"     element={<SearchResults/>}/>
              <Route path="/seats"      element={<SeatSelection/>}/>
              <Route path="/passengers" element={<PassengerDetails/>}/>
              <Route path="/ticket"     element={<Ticket/>}/>
              <Route path="/bookings"   element={<Bookings/>}/>
              <Route path="/admin"      element={<Admin/>}/>
              <Route path="*"           element={<Navigate to="/" replace/>}/>
            </Routes>
          </BookingProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
