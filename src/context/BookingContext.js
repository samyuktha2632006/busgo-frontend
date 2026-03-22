import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useState(null);
  // { from, to, date, paxCount }

  const [selectedBus, setSelectedBus] = useState(null);
  // full bus object from API including bookedSeats, ladiesSeats

  const [selectedSeats, setSelectedSeats] = useState([]);
  // array of seat numbers e.g. [5, 6]

  const [passengers, setPassengers] = useState([]);
  // array of { name, age, gender, idType, seatNumber }

  const [contactInfo, setContactInfo] = useState({ phone: '', email: '' });

  const [confirmedBooking, setConfirmedBooking] = useState(null);
  // full booking object returned from API

  const resetBooking = () => {
    setSelectedBus(null);
    setSelectedSeats([]);
    setPassengers([]);
    setContactInfo({ phone: '', email: '' });
    setConfirmedBooking(null);
  };

  return (
    <BookingContext.Provider value={{
      searchParams,   setSearchParams,
      selectedBus,    setSelectedBus,
      selectedSeats,  setSelectedSeats,
      passengers,     setPassengers,
      contactInfo,    setContactInfo,
      confirmedBooking, setConfirmedBooking,
      resetBooking
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
