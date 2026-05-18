import { create } from 'zustand';
import api from '../lib/axios';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/login', { email, password });
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, loading: false });
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur de connexion.';
      set({ loading: false, error: message });
      return false;
    }
  },

  register: async (name, email, password, password_confirmation) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/register', { name, email, password, password_confirmation });
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, loading: false });
      return true;
    } catch (err) {
      const message = err.response?.data?.message || "Erreur d'inscription.";
      set({ loading: false, error: message });
      return false;
    }
  },

  logout: async () => {
    try { await api.post('/logout'); } catch (_) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
