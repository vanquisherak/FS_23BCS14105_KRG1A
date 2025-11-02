import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000',
});

if (typeof window !== 'undefined') {
  const token = localStorage.getItem('bookverse_token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

export default api;
