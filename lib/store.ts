import { create } from 'zustand';
import api, { Document, LoginCredentials } from './api';

interface UserState {
  isAuthenticated: boolean;
  user: {
    id: number | null;
    email: string | null;
    name: string | null;
  } | null;
}

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  loading: boolean;
  error: string | null;
}

interface AppState extends UserState, DocumentState {
  // User actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  
  // Document actions
  fetchDocuments: () => Promise<void>;
  fetchDocument: (id: number) => Promise<void>;
  uploadDocument: (file: File, title: string) => Promise<void>;
  processDocument: (id: number) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // User state
  isAuthenticated: false,
  user: null,
  
  // Document state
  documents: [],
  currentDocument: null,
  loading: false,
  error: null,
  
  // User actions
  login: async (credentials: LoginCredentials) => {
    try {
      set({ loading: true, error: null });
      const response = await api.login(credentials);
      
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      
      set({ 
        isAuthenticated: true,
        user: response.user,
        loading: false
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Login failed',
        loading: false
      });
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await api.logout();
      set({ 
        isAuthenticated: false,
        user: null,
        documents: [],
        currentDocument: null
      });
    } catch (error: any) {
      set({ error: 'Logout failed' });
      throw error;
    }
  },
  
  // Document actions
  fetchDocuments: async () => {
    try {
      set({ loading: true, error: null });
      const documents = await api.getDocuments();
      set({ documents, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch documents',
        loading: false
      });
      throw error;
    }
  },
  
  fetchDocument: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const document = await api.getDocument(id);
      set({ currentDocument: document, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch document',
        loading: false
      });
      throw error;
    }
  },
  
  uploadDocument: async (file: File, title: string) => {
    try {
      set({ loading: true, error: null });
      const document = await api.uploadDocument(file, title);
      set(state => ({ 
        documents: [...state.documents, document],
        loading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to upload document',
        loading: false
      });
      throw error;
    }
  },
  
  processDocument: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const updatedDocument = await api.processDocument(id);
      
      // Update both the documents list and currentDocument if it matches
      set(state => ({
        documents: state.documents.map(doc => 
          doc.id === updatedDocument.id ? updatedDocument : doc
        ),
        currentDocument: state.currentDocument?.id === updatedDocument.id 
          ? updatedDocument 
          : state.currentDocument,
        loading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to process document',
        loading: false
      });
      throw error;
    }
  }
}));

export default useStore; 