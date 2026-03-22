import axios from 'axios';

const API = axios.create({ baseURL: 'https://busgo-backend-bnci.onrender.com/api' });
//const API = axios.create({ baseURL: 'https://YOUR-RENDER-URL.onrender.com/api' });

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('busgo_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const authAPI = {
  register: (data)  => API.post('/auth/register', data),
  login:    (data)  => API.post('/auth/login', data),
  me:       ()      => API.get('/auth/me'),
};

// Buses
export const busAPI = {
  search:  (from, to, date) => API.get(`/buses/search?from=${from}&to=${to}&date=${date}`),
  getAll:  ()               => API.get('/buses'),
  add:     (data)           => API.post('/buses', data),
  update:  (id, data)       => API.put(`/buses/${id}`, data),
  delete:  (id)             => API.delete(`/buses/${id}`),
};

// Bookings
export const bookingAPI = {
  create:     (data) => API.post('/bookings', data),
  myBookings: ()     => API.get('/bookings/my'),
  cancel:     (id)   => API.put(`/bookings/${id}/cancel`),
  all:        ()     => API.get('/bookings'),
};

// Admin
export const adminAPI = {
  dashboard:   ()   => API.get('/admin/dashboard'),
  users:       ()   => API.get('/admin/users'),
  toggleBlock: (id) => API.put(`/admin/users/${id}/block`),
};

export default API;
