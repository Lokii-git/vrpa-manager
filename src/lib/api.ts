// API Configuration
// Always use relative path to work with Vite proxy in all environments
const API_BASE_URL = '/api';

// Helper function for API calls
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Get auth token from sessionStorage
  const token = sessionStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// ==================== DEVICES API ====================

export const devicesAPI = {
  getAll: () => apiCall<any[]>('/devices'),
  
  create: (device: any) => apiCall<any>('/devices', {
    method: 'POST',
    body: JSON.stringify(device),
  }),
  
  update: (id: string, device: any) => apiCall<any>(`/devices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(device),
  }),
  
  delete: (id: string) => apiCall<void>(`/devices/${id}`, {
    method: 'DELETE',
  }),
};

// ==================== TEAM MEMBERS API ====================

export const teamMembersAPI = {
  getAll: () => apiCall<any[]>('/team-members'),
  
  create: (member: any) => apiCall<any>('/team-members', {
    method: 'POST',
    body: JSON.stringify(member),
  }),
  
  update: (id: string, member: any) => apiCall<any>(`/team-members/${id}`, {
    method: 'PUT',
    body: JSON.stringify(member),
  }),
  
  delete: (id: string) => apiCall<void>(`/team-members/${id}`, {
    method: 'DELETE',
  }),
};

// ==================== PING HISTORY API ====================

export const pingHistoryAPI = {
  getAll: (deviceId?: string, days?: number) => {
    const params = new URLSearchParams();
    if (deviceId) params.append('deviceId', deviceId);
    if (days) params.append('days', days.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall<any[]>(`/ping-history${query}`);
  },
  
  create: (record: any) => apiCall<any>('/ping-history', {
    method: 'POST',
    body: JSON.stringify(record),
  }),
};

// ==================== EMAIL TEMPLATE API ====================

export const emailTemplateAPI = {
  get: () => apiCall<{ template: string }>('/email-template'),
  
  update: (template: string) => apiCall<{ template: string }>('/email-template', {
    method: 'PUT',
    body: JSON.stringify({ template }),
  }),
};

// ==================== HEALTH CHECK ====================

export const healthAPI = {
  check: () => apiCall<{ status: string; timestamp: string }>('/health'),
};
