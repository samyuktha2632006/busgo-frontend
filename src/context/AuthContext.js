import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(() => JSON.parse(localStorage.getItem('busgo_user') || 'null'));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('busgo_token', data.token);
    localStorage.setItem('busgo_user',  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, phone, password) => {
    const { data } = await authAPI.register({ name, email, phone, password });
    localStorage.setItem('busgo_token', data.token);
    localStorage.setItem('busgo_user',  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('busgo_token');
    localStorage.removeItem('busgo_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
