import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoginModalOpen: false,
  isRegisterModalOpen: false,
  loading: false,
  error: null,

  openLoginModal: () => set({ isLoginModalOpen: true, isRegisterModalOpen: false, error: null }),
  closeLoginModal: () => set({ isLoginModalOpen: false, error: null }),
  
  openRegisterModal: () => set({ isRegisterModalOpen: true, isLoginModalOpen: false, error: null }),
  closeRegisterModal: () => set({ isRegisterModalOpen: false, error: null }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false, isLoginModalOpen: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al registrar usuario');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false, isRegisterModalOpen: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  }
}));
