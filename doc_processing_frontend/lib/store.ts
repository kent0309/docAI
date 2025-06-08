import { create } from 'zustand';
import api from './api';

// Define user interface
interface User {
  id: number;
  username: string;
  email: string;
}

// Define authentication state interface
interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User) => void;
}

// Create auth store
export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
  user: null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
  isLoading: false,
  error: null,
  
  // Login action
  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Send login request
      const response = await api.post('/token/', {
        username,
        password
      });
      
      const { access, refresh } = response.data;
      
      // Save tokens to localStorage
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Update state
      set({
        token: access,
        refreshToken: refresh,
        isAuthenticated: true,
        isLoading: false
      });
      
      // Fetch user details
      const userResponse = await api.get('/user/');
      set({ user: userResponse.data });
      
    } catch (error: any) {
      // Handle error
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Login failed. Please try again.'
      });
    }
  },
  
  // Register action
  register: async (username: string, password: string, email: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Send register request
      await api.post('/register/', {
        username,
        password,
        email
      });
      
      // Login after successful registration
      const loginResponse = await api.post('/token/', {
        username,
        password
      });
      
      const { access, refresh } = loginResponse.data;
      
      // Save tokens to localStorage
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Update state
      set({
        token: access,
        refreshToken: refresh,
        isAuthenticated: true,
        isLoading: false
      });
      
      // Fetch user details
      const userResponse = await api.get('/user/');
      set({ user: userResponse.data });
      
    } catch (error: any) {
      // Handle error
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Registration failed. Please try again.'
      });
    }
  },
  
  // Logout action
  logout: () => {
    // Clear tokens from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Reset state
    set({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false
    });
  },
  
  // Clear error action
  clearError: () => {
    set({ error: null });
  },
  
  // Set user action
  setUser: (user: User) => {
    set({ user });
  }
}));

export default useAuthStore; 