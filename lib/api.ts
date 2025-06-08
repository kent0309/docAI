import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token in requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

export interface Document {
  id: number;
  title: string;
  file_path: string;
  uploaded_at: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  extracted_data?: any;
}

export const api = {
  // Auth endpoints
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login/', credentials);
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    localStorage.removeItem('token');
  },
  
  // Document endpoints
  getDocuments: async (): Promise<Document[]> => {
    const response = await apiClient.get('/documents/');
    return response.data;
  },
  
  getDocument: async (id: number): Promise<Document> => {
    const response = await apiClient.get(`/documents/${id}/`);
    return response.data;
  },
  
  uploadDocument: async (file: File, title: string): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    
    const response = await apiClient.post('/documents/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  processDocument: async (id: number): Promise<Document> => {
    const response = await apiClient.post(`/documents/${id}/process/`);
    return response.data;
  },
  
  // Stats endpoints
  getStats: async () => {
    const response = await apiClient.get('/stats/');
    return response.data;
  },
};

export default api; 