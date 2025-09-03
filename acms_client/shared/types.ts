export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export type UserRole = 'reception' | 'doctor' | 'lab_technician' | 'pharmacy' | 'nurse' | 'patient' | 'admin';

export interface DashboardStats {
  totalPatients: number;
  dailyVisits: number;
  pendingAppointments: number;
  activeTreatments: number;
  labTestsPending: number;
  prescriptionsPending: number;
  totalStudents?: number;  // Admin-specific
  doctors?: number;
  receptions?: number;
  nurses?: number;
  lab_technicians?: number;
  pharmacists?: number;
}

export interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  year: number;
  blood_type?: string;
  phone?: string;
}

export interface ReceptionRequest {
  request_id: string;
  student_id: string;
  receptionist_id: string;
  priority_level: string;
  initial_notes?: string;
  status: string;
  created_at: string;
}

export interface PatientHistory {
  history_id: string;
  request_id: string;
  doctor_id: string;
  complaint: string;
  diagnosis?: string;
  treatment?: string;
  created_at: string;
}

export interface LabOrder {
  order_id: string;
  request_id: string;
  doctor_id: string;
  lab_request: string;
  clinical_notes?: string;
  status: string;
  created_at: string;
}

export interface Prescription {
  prescription_id: string;
  request_id: string;
  doctor_id: string;
  diagnosis: string;
  status: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  medicine_name: string;
  category: string;
  quantity: number;
  min_stock: number;
  dispenser_role: string;
  expiry_date?: string;
  status: string;
}

