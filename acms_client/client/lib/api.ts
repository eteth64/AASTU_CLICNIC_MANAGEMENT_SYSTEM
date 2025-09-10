// import UploadStudents from "@/pages/UploadStudents";

const API_BASE_URL = 'http://localhost:3000/api';

// Generic API request function
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('acms-token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  login: (email: string, password: string) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => apiRequest('/auth/me'),
};

// Admin API calls
export const adminAPI = {
  getUsers: () => apiRequest('/admin/users'),
  createUser: (userData: any) => 
    apiRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  updateUserStatus: (id: string, isActive: boolean) =>
    apiRequest(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    }),
  updateUserRole: (id: string, role: string) =>
    apiRequest(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  getStudents: () => apiRequest('/admin/students'),
  getAnalytics: () => apiRequest('/admin/analytics'),
   
};

// Reception API calls
export const receptionAPI = {
  searchStudent: (studentId: string) => apiRequest(`/reception/students/${studentId}`),
  getAnalytics: () => apiRequest('/reception/analytics'),
  createRequest: (requestData: any) =>
    apiRequest('/reception/requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    }),
};

// Doctor API calls
export const doctorAPI = {
  getRequests: () => apiRequest('/doctor/requests'),
  getPatientHistory: (requestId: string) => apiRequest(`/doctor/requests/${requestId}`),
  getInventory: () => apiRequest(`/doctor/inventory`),
  getAnalytics: () => apiRequest(`/doctor/analytics`),
  getLabResult: (requestId: string) => apiRequest(`/doctor/lab-results/${requestId}`),
  createLabOrder: (orderData: any) =>
    apiRequest('/doctor/lab-orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
  createPrescription: (prescriptionData: any) =>
    apiRequest('/doctor/prescriptions', {
      method: 'POST',
      body: JSON.stringify(prescriptionData),
    }),
  startConsultation: (consultationData: any) =>
    apiRequest('/doctor/start-consultation', {
      method: 'POST',
      body: JSON.stringify(consultationData),
    }),
};


// Lab API calls
export const labAPI = {
  getPendingOrders: () => apiRequest('/lab/orders'),
  getOrderDetails: (orderId: string) => apiRequest(`/lab/orders/${orderId}`),
  submitLabResult: (resultData: any) =>
    apiRequest('/lab/results', {
      method: 'POST',
      body: JSON.stringify(resultData),
    }),
};

// Pharmacy API calls
export const pharmacyAPI = {
  getPendingPrescriptions: () => apiRequest('/pharmacy/prescriptions'),
  getInventory: (id:string) => apiRequest(`/pharmacy/inventory/${id}`),
  dispenseMedication: (dispenseData: any) =>
    apiRequest('/pharmacy/dispense', {
      method: 'POST',
      body: JSON.stringify(dispenseData),
    }),
};

// Nurse API calls
export const nurseAPI = {
  getPendingPrescriptions: () => apiRequest('/nurse/prescriptions'),
  dispenseMedication: (dispenseData: any) =>
    apiRequest('/nurse/dispense', {
      method: 'POST',
      body: JSON.stringify(dispenseData),
    }),
};

// Inventory API calls
export const inventoryAPI = {
  getAll: () => apiRequest('/inventory'),
  getLowStock: () => apiRequest('/inventory/low-stock'),
  getItem: (id: string) => apiRequest(`/inventory/${id}`),
  createItem: (itemData: any) =>
    apiRequest('/inventory', {
      method: 'POST',
      body: JSON.stringify(itemData),
    }),
  updateItem: (id: string, itemData: any) =>
    apiRequest(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    }),
  deleteItem: (id: string) =>
    apiRequest(`/inventory/${id}`, {
      method: 'DELETE',
    }),
  getTransactions: () => apiRequest('/inventory/transactions'),
};

// upload students API call
export const uploadAPI = {
  uploadStudents: (formData: FormData) =>
    fetch(`${API_BASE_URL}/admin/students/upload`, {  
      method: 'POST',
      body: formData,
    }).then(response => { 
      if (!response.ok) {
        return response.json().then(errorData => {
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }); 
      }
      return response.json();
    })
};

export const adminAPIs = {
  getUsers: () => apiRequest('/admin/users'),
  createUser: (userData: any) => 
    apiRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  updateUserStatus: (id: string, isActive: boolean) =>
    apiRequest(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    }),
  updateUserRole: (id: string, role: string) =>
    apiRequest(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  getStudents: () => apiRequest('/admin/students'),
  getAnalytics: () => apiRequest('/admin/analytics'),
  // Add upload students endpoint
  uploadStudents: (formData: FormData) =>
    fetch(`${API_BASE_URL}/admin/students/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('acms-token')}`,
      },
      body: formData,
    }).then(response => {
      if (!response.ok) {
        return response.json().then(errorData => {
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        });
      }
      return response.json();
    })
};