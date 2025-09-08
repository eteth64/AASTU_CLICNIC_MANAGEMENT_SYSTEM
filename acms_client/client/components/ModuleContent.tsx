import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import axiosInstance from "axios"; 
import {
  Search,
  UserPlus,
  CheckCircle,
  TestTube,
  Pill,
  Syringe,
  FileText,
  Calendar,
  Users,
  Settings,
  Activity,
  AlertTriangle,
  Clock,
  Stethoscope,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  Plus,
  Minus,
  X
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  adminAPI,
  receptionAPI,
  doctorAPI,
  labAPI,
  pharmacyAPI,
  nurseAPI,
  inventoryAPI
} from '@/lib/api';
import { open } from 'inspector/promises';

interface ModuleContentProps {
  moduleTitle: string;
  moduleKey: string;
  role: string;
  setSelectedModule?: (module: string) => void;
}



interface LabResult {
  request_id: number;
  technician_name: string | null;
  lab_result: string;
  technical_notes: string | null;
}

interface ApiResponse {
  message: string;
  data: LabResult[];
}

export default function ModuleContent({ moduleTitle, moduleKey, role, setSelectedModule }: ModuleContentProps) {
  const [formData, setFormData] = useState<any>({
    searchId: '',
    complaint: '',
    symptoms: '',
    examination: '',
    diagnosis: '',
    treatment: '',
    indication: '',
    instructions: '',
    clinicalNotes: '',
    patientNotes: '',
    studentId: '',
    sendStudentId: '',
    selectedDoctor: '',
    priority: '',
    receptionNotes: '',
    labStudentId: '',
    labRequest: '',
    labNotes: '',
    nurseStudentId: '',
    nurseRequest: '',
    nursePriority: '',
    nurseNotes: '',
    pharmacyStudentId: '',
    prescribedDrugs: '',
    pharmacyDiagnosis: '',
    pharmacyInstructions: '',
    resultStudentId: '',
    labResults: '',
    technicianNotes: '',
    newRole: '',
    roleChangeReason: '',
    firstName: '',
    lastName: '',
    userEmail: '',
    userPassword: '',
    userRole: '',
    itemName: '',
    itemCategory: '',
    itemQuantity: '',
    itemMinStock: '',
    itemUnit: '',
    itemExpiry: '',
    itemSupplier: '',
    itemPrice: '',
  });

  const [studentData, setStudentData] = useState<any>(null);
  const [doctorRequests, setDoctorRequests] = useState<any[]>([]);
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [prescriptionRequests, setPrescriptionRequests] = useState<any[]>([]);
  const [nurseRequests, setNurseRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSendToDoctorForm, setShowSendToDoctorForm] = useState(false);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [showResponseFormForResult, setShowResponseFormForResult] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showRoleChangeForm, setShowRoleChangeForm] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [studentFilters, setStudentFilters] = useState({
    department: '',
    year: '',
    visitStatus: ''
  });

  const [inventoryFilters, setInventoryFilters] = useState({
    category: '',
    status: ''
  });
  const [showResultForm, setShowResultForm] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedLabTests, setSelectedLabTests] = useState<string[]>([]);
  const [prescriptionDetails, setPrescriptionDetails] = useState<any[]>([]);
  const [newPrescriptionItem, setNewPrescriptionItem] = useState({
    inventory_id: '',
    medicine_name: '',
    dosage: '',
    quantity: '',
    instructions: ''
  });


  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [receptionAnalytics, setReceptionAnalytics] = useState<any>(null);
  const [doctorAnalytics, setDoctorAnalytics] = useState<any>(null);
  const [patientHistory, setPatientHistory] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState<string[]>([]);

  const labTestOptions = [
    { value: 'cbc', label: 'Complete Blood Count (CBC)' },
    { value: 'blood_sugar', label: 'Blood Sugar Level' },
    { value: 'urinalysis', label: 'Urinalysis' },

  ];

 


  const inventoryCategories = [
    'Pain Relief',
    'Antibiotics',
    'Diabetes',
    'Medical Supplies',
    'Vitamins',
    'Cardiology',

  ];

  // Fetch data based on module
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('acms-token');
      if (!token) return;

      setIsLoading(true);
      try {
        switch (moduleKey) {
          case 'Student Search':
            const analytics = await receptionAPI.getAnalytics();

            setReceptionAnalytics(analytics)
            break;
          case 'Patient Queue':
            const requests = await doctorAPI.getRequests();
            const data = await doctorAPI.getAnalytics();
            setDoctorRequests(requests);
            setDoctorAnalytics(data);
            handleFetchInventory()
            break;
          case 'Doctor Requests':
            if (role === 'lab_technician') {
              const orders = await labAPI.getPendingOrders();
              setLabOrders(orders);
            } else if (role === 'pharmacy') {
              const prescriptions = await pharmacyAPI.getPendingPrescriptions();
              setPrescriptionRequests(prescriptions);
            } else if (role === 'nurse') {
              const nursePrescriptions = await nurseAPI.getPendingPrescriptions();
              setNurseRequests(nursePrescriptions);
            }
            break;
          case 'User Management':
            const usersData = await adminAPI.getUsers();
            const studentData = await adminAPI.getStudents();
            setStudents(studentData);
            setUsers(usersData);
            break;
          case 'Students':
            const studentsData = await adminAPI.getStudents();
            setStudents(studentsData);
            break;
          case 'Inventory Management':
            const inventoryData = await inventoryAPI.getAll();
            setInventory(inventoryData);
            const transactionsData = await inventoryAPI.getTransactions();
            setTransactions(transactionsData);
            break;
          default:
            break;
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [moduleKey, role]);





  const handleStudentSearch = async () => {
    if (!formData.studentId) {
      toast({
        title: "Error",
        description: "Please enter a student ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await receptionAPI.searchStudent(formData.studentId);
      setStudentData(data);
      toast({
        title: "Success",
        description: "Student data retrieved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch student data",
        variant: "destructive"
      });
      setStudentData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToDoctor = async () => {
    console.log("Sending to doctor:", formData.priority);
    console.log("Student ID:", studentData?.student[0].student_id);
    if (!studentData?.students?.[0]) console.log("error");

    try {
      await receptionAPI.createRequest({
        student_id: studentData?.student?.[0].student_id,
        priority_level: formData.priority || 'routine',
        initial_notes: formData.receptionNotes || ''
      });

      toast({
        title: "Success",
        description: "Student sent to doctor successfully",
      });
      setShowSendToDoctorForm(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send student to doctor",
        variant: "destructive"
      });
    }
  };

  const handleStartConsultation = async (requestId: string, complaint: string) => {
    try {
      await doctorAPI.startConsultation({
        request_id: requestId,
        complaint: complaint
      });

      toast({
        title: "Success",
        description: "Consultation started successfully",
      });
      setExpandedPatient(null);

      // Refresh requests
      const requests = await doctorAPI.getRequests();
      setDoctorRequests(requests);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start consultation",
        variant: "destructive"
      });
    }
  };


  const handleFetchPatientHistory = async (requestId: string) => {
    try {
      const history = await doctorAPI.getPatientHistory(requestId);

      setPatientHistory(history);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch patient history",
        variant: "destructive"
      });
    }
  };

  const handleCreateLabOrder = async (requestId: string, labTests: string[], clinicalNotes: string) => {
    try {
      await doctorAPI.createLabOrder({
        request_id: requestId,
        lab_request: labTests.join(', '),
        clinical_notes: clinicalNotes
      });

      toast({
        title: "Success",
        description: "Lab order created successfully",
      });
      setExpandedPatient(null);

      // Refresh requests
      const requests = await doctorAPI.getRequests();
      setDoctorRequests(requests);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create lab order",
        variant: "destructive"
      });
    }
  };



  const handleCreatePrescription = async (requestId: string, diagnosis: string, prescriptionData: any[]) => {
    try {
      await doctorAPI.createPrescription({
        request_id: requestId,
        diagnosis: diagnosis,
        prescription_details: prescriptionData
      });

      toast({
        title: "Success",
        description: "Prescription created successfully",
      });
      setExpandedPatient(null);
      setPrescriptionDetails([]);

      // Refresh requests
      const requests = await doctorAPI.getRequests();
      setDoctorRequests(requests);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create prescription",
        variant: "destructive"
      });
    }
  };

  const handleSubmitLabResult = async (orderId: string, result: string, notes: string) => {
    try {
      await labAPI.submitLabResult({
        order_id: orderId,
        lab_result: result,
        technical_notes: notes
      });

      toast({
        title: "Success",
        description: "Lab result submitted successfully",
      });
      setShowResultForm(null);

      // Refresh orders
      const orders = await labAPI.getPendingOrders();
      setLabOrders(orders);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit lab result",
        variant: "destructive"
      });
    }
  };




  const handleFetchLabResult = async (requestId: string): Promise<LabResult[] | null> => {
    try {
      // Validate requestId
      if (!requestId || isNaN(Number(requestId))) {
        toast({
          title: "Error",
          description: "Invalid or missing request ID",
          variant: "destructive",
        });
        return null;
      }

      // Make API call
      const response = await doctorAPI.getLabResult(requestId);



      // Verify response structure
      const data: ApiResponse = response.data; // Assuming axios or similar, where response.data contains the payload
      if (!Array.isArray(data)) {
        throw new Error("Unexpected response format");
      }

      // Show success toast
      toast({
        title: "Success",
        description: "Lab results fetched successfully",
      });

      setLabResults(data)

    } catch (error: any) {
      // Log error for debugging
      console.error("Failed to fetch lab results:", error);

      // Show error toast with specific message
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch lab results",
        variant: "destructive",
      });

      return null;
    }
  };

  const handleGetInventoryItem = async (itemId: string) => {
    try {
      const response = await pharmacyAPI.getInventory(itemId);
      return response;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch inventory item",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleDispenseMedication = async (prescriptionDrugId: string, quantity: number, notes: string) => {
    try {
      if (role === 'pharmacy') {
        await pharmacyAPI.dispenseMedication({
          prescription_drug_id: prescriptionDrugId,
          dispensed_quantity: quantity,
          notes: notes
        });
      } else if (role === 'nurse') {
        await nurseAPI.dispenseMedication({
          prescription_drug_id: prescriptionDrugId,
          dispensed_quantity: quantity,
          notes: notes
        });
      }

      toast({
        title: "Success",
        description: "Medication dispensed successfully",
      });

      // Refresh requests
      if (role === 'pharmacy') {
        const prescriptions = await pharmacyAPI.getPendingPrescriptions();
        setPrescriptionRequests(prescriptions);
      } else if (role === 'nurse') {
        const nursePrescriptions = await nurseAPI.getPendingPrescriptions();
        setNurseRequests(nursePrescriptions);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to dispense medication",
        variant: "destructive"
      });
    }
  };

  const handleCreateUser = async () => {
    if (!formData.firstName || !formData.lastName || !formData.userEmail || !formData.userPassword || !formData.userRole) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await adminAPI.createUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.userEmail,
        password: formData.userPassword,
        role: formData.userRole
      });

      toast({
        title: "Success",
        description: "User created successfully",
      });

      // Reset form
      setFormData({
        ...formData,
        firstName: '',
        lastName: '',
        userEmail: '',
        userPassword: '',
        userRole: ''
      });

      // Refresh users
      const usersData = await adminAPI.getUsers();
      setUsers(usersData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive"
      });
    }
  };

  const handleUpdateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await adminAPI.updateUserStatus(userId, isActive);

      toast({
        title: "Success",
        description: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      });

      // Refresh users
      const usersData = await adminAPI.getUsers();
      setUsers(usersData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);

      toast({
        title: "Success",
        description: "User role updated successfully",
      });

      setShowRoleChangeForm(false);

      // Refresh users
      const usersData = await adminAPI.getUsers();
      setUsers(usersData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const handleCreateInventoryItem = async () => {
    if (!formData.itemName || !formData.itemCategory || !formData.itemQuantity || !formData.itemMinStock) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await inventoryAPI.createItem({
        medicine_name: formData.itemName,
        category: formData.itemCategory,
        quantity: parseInt(formData.itemQuantity),
        min_stock: parseInt(formData.itemMinStock),
        dispenser_role: role,
        expiry_date: formData.itemExpiry || null,
        supplier: formData.itemSupplier || '',
        price: formData.itemPrice || 0
      });

      toast({
        title: "Success",
        description: "Inventory item created successfully",
      });

      // Reset form
      setFormData({
        ...formData,
        itemName: '',
        itemCategory: '',
        itemQuantity: '',
        itemMinStock: '',
        itemUnit: '',
        itemExpiry: '',
        itemSupplier: '',
        itemPrice: ''
      });

      // Refresh inventory
      const inventoryData = await inventoryAPI.getAll();
      setInventory(inventoryData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create inventory item",
        variant: "destructive"
      });
    }
  };

  const handleUpdateInventoryItem = async (itemId: string, updates: any) => {
    try {
      await inventoryAPI.updateItem(itemId, updates);

      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      });

      // Refresh inventory
      const inventoryData = await inventoryAPI.getAll();
      setInventory(inventoryData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update inventory item",
        variant: "destructive"
      });
    }
  };

  const handleDeleteInventoryItem = async (itemId: string) => {
    try {
      await inventoryAPI.deleteItem(itemId);

      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
      });

      // Refresh inventory
      const inventoryData = await inventoryAPI.getAll();
      setInventory(inventoryData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete inventory item",
        variant: "destructive"
      });
    }
  };

  const addPrescriptionItem = () => {
    if (!newPrescriptionItem.inventory_id || !newPrescriptionItem.medicine_name || !newPrescriptionItem.dosage || !newPrescriptionItem.quantity) {
      toast({
        title: "Error",
        description: "Please fill all required fields for the prescription item",
        variant: "destructive"
      });
      return;
    }

    setPrescriptionDetails([...prescriptionDetails, { ...newPrescriptionItem }]);
    setNewPrescriptionItem({
      inventory_id: '',
      medicine_name: '',
      dosage: '',
      quantity: '',
      instructions: ''
    });
  };

  const removePrescriptionItem = (index: number) => {
    const updatedItems = [...prescriptionDetails];
    updatedItems.splice(index, 1);
    setPrescriptionDetails(updatedItems);
  };


  const handleFetchInventory = async () => {
    try {
      const response = await doctorAPI.getInventory();
      setInventory(response.data);


    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch inventory",
        variant: "destructive"
      });
    }
  };


  const openModal = async (inventoryId) => {
    try {
      const inventoryData = await handleGetInventoryItem(inventoryId); // Assuming this returns a Promise
      console.log('inventory data', inventoryData)
      setSelectedInventory(inventoryData);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      // Optionally show an error message to the user
    }
  };

  console.log('open modal', openModal)
  console.log('selected inventory', selectedInventory)


  // Function to handle closing the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInventory(null);
  };

  // Function to handle confirming the dispense action
  const confirmDispense = (prescriptionDrugId, quantity) => {
    handleDispenseMedication(prescriptionDrugId, quantity, 'pharmacy notes');
    closeModal(); // Close the modal after confirming
  };


// add the comment



  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      
      const res = await axiosInstance.post("/api/admin/upload-students", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      // Check response for inserted count or errors
      if (res.data.errors && res.data.errors.length > 0) {
        setErrors(res.data.errors);
        setMessage("Some rows failed to upload");
      } else {
        setMessage(res.data.message || "Upload successful");
        setErrors([]);
      }
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.message || "Upload failed");
      setErrors([]);
    }
  };


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
        setMessage("");
        setErrors([]);
      }
    };



  const renderReceptionistModules = () => {
    switch (moduleKey) {
      case 'Student Search':
        return (
          <div className="space-y-6">
            {/* Analytics Cards */}
            {receptionAnalytics &&
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card style={{ backgroundColor: 'rgb(17,40,77)', color: 'white' }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium opacity-90">Total Visits Today</p>
                        <p className="text-2xl font-bold">{receptionAnalytics[0]?.total_requests}</p>
                      </div>
                      <Users className="h-8 w-8 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: 'rgb(174,138,47)', color: 'white' }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium opacity-90">In Consultation</p>
                        <p className="text-2xl font-bold">{receptionAnalytics[0]?.with_doctor_requests}</p>
                      </div>
                      <Stethoscope className="h-8 w-8 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: 'rgb(198,200,202)', color: 'rgb(17,40,77)' }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">At Laboratory</p>
                        <p className="text-2xl font-bold">{receptionAnalytics[0]?.with_laboratory_requests}</p>
                      </div>
                      <TestTube className="h-8 w-8" />
                    </div>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: 'rgb(198,200,202)', color: 'rgb(17,40,77)' }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">At Pharmacy</p>
                        <p className="text-2xl font-bold">{receptionAnalytics[0]?.with_pharmacy_requests}</p>
                      </div>
                      <Pill className="h-8 w-8" />
                    </div>
                  </CardContent>
                </Card>
              </div>}

            {/* Search Card */}
            <Card className='mb-16'>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Student Search by ID</span>
                </CardTitle>
                <CardDescription>Enter student ID to fetch student data and medical history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Input
                    placeholder="Enter Student ID (e.g., AASTU001)"
                    className="flex-1"
                    value={formData.studentId || ''}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleStudentSearch}
                    style={{ backgroundColor: 'rgb(17,40,77)' }}
                    className="hover:opacity-90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Searching...' : 'Search Student'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Student Data Display */}
            {studentData && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Student Information</span>

                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Student Basic Info */}
                      {studentData.student ? (<>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                              <span className="text-lg font-bold text-blue-600">
                                {studentData.student.first_name?.charAt(0)}{studentData.student.last_name?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">
                                {studentData.student.first_name} {studentData.student.last_name}
                              </h3>
                              <p className="text-sm text-muted-foreground">{formData.studentId}</p>
                              {studentData.lastRequest.length > 0 && (
                                <Badge variant="outline" className="mt-1 bg-green-50 text-green-700">
                                  {studentData?.lastRequest[0].status}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Email</Label>
                              <p className="text-sm">{studentData.student.email}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Department</Label>
                              <p className="text-sm">{studentData.student.department}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Year of Study</Label>
                              <p className="text-sm">Year {studentData.student.year}</p>
                            </div>
                            <div>
                              {studentData.lastRequest.length > 0 && (
                                <>
                                  <Label className="text-sm font-medium">Last Visit</Label>
                                  <p className="text-sm">{studentData.lastRequest[0]?.created_at?.split('T')[0] || 'N/A'}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>


                        <div className="space-y-4">
                          <h4 className="font-medium">Quick Actions</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              className="w-full"
                              variant="outline"
                              onClick={() => setShowSendToDoctorForm(!showSendToDoctorForm)}
                            >
                              {showSendToDoctorForm ? 'Cancel Send' : 'Send to Doctor'}
                            </Button>
                            {studentData.history.length > 0 && (
                              <Button
                                className="w-full"
                                variant="outline"
                              >
                                View Full History
                              </Button>
                            )}
                          </div>

                          {studentData.lastRequest.length > 0 && (<div className="pt-2">
                            <Label className="text-sm font-medium">Current Status</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <p className="text-sm">{studentData.lastRequest[0].status}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{studentData.lastRequest[0].created_at}</p>
                          </div>)}
                        </div>
                      </>
                      ) : <p>No student data available</p>}
                    </div>
                  </CardContent>
                </Card>

                {/* Send to Doctor Form - Only appears when button is clicked */}
                {showSendToDoctorForm && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Send to Doctor</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">


                      <div>
                        <Label>Priority Level</Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(value) => setFormData({ ...formData, priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="routine">Routine</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Initial Notes (Optional)</Label>
                        <Textarea
                          placeholder="Enter any initial observations or notes for the doctor..."
                          rows={3}
                          value={formData.receptionNotes}
                          onChange={(e) => setFormData({ ...formData, receptionNotes: e.target.value })}
                        />
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          className="flex-1"
                          style={{ backgroundColor: 'rgb(17,40,77)' }}
                          onClick={handleSendToDoctor}
                        >
                          Confirm and Send
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowSendToDoctorForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Medical History */}
                {studentData.history.length > 0 && <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Medical History</span>
                      <Badge variant="outline">{studentData.history?.length || 0} visits</Badge>
                    </CardTitle>
                    <CardDescription>Recent medical visits and treatments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {studentData.history && studentData.history.length > 0 ? (
                        studentData.history.map((visit: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-150">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-4">
                                <div>
                                  <p className="font-medium">{new Date(visit.created_at).toLocaleDateString()}</p>
                                  <p className="text-sm text-muted-foreground">Doctor name: {visit.doctor_first_name}</p>
                                </div>
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  Completed
                                </Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                              <div>
                                <Label className="text-xs font-medium">Complaint</Label>
                                <p className="text-sm">{visit.complaint || 'N/A'}</p>
                              </div>
                              <div>
                                <Label className="text-xs font-medium">Diagnosis</Label>
                                <p className="text-sm">{visit.diagnosis || 'N/A'}</p>
                              </div>
                              <div>
                                <Label className="text-xs font-medium">Treatment</Label>
                                <p className="text-sm">{visit.treatment || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No medical history found</p>
                      )}
                    </div>
                  </CardContent>
                </Card>}
              </>
            )}
          </div>
        );
      case 'Send to Doctor':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Send Student to Doctor</span>
                </CardTitle>
                <CardDescription>Forward student to doctor for consultation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Student ID Number</Label>
                  <Input
                    placeholder="Enter Student ID (e.g., AASTU001)"
                    value={formData.sendStudentId || ''}
                    onChange={(e) => setFormData({ ...formData, sendStudentId: e.target.value })}
                  />
                </div>



                <div>
                  <Label>Priority Level (Optional)</Label>
                  <Select value={formData.priority || ''} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full" onClick={handleSendToDoctor}>Send to Doctor</Button>
              </CardContent>
            </Card>


          </div>
        );
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{moduleTitle}</CardTitle>
              <CardDescription>This module is under development</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Content for {moduleTitle} will be available soon.</p>
            </CardContent>
          </Card>
        );
    }
  };

  const renderDoctorModules = () => {
    switch (moduleKey) {
      case 'Patient Queue':
        return (
          <div className="space-y-6">
            {/* Card Boxes Section */}
            {doctorAnalytics && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card style={{ backgroundColor: 'rgb(17,40,77)', color: 'white' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-90">Reception Requests</p>
                      <p className="text-2xl font-bold">{doctorRequests.filter(r => r.status === 'pending').length}</p>
                    </div>
                    <Users className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: 'rgb(174,138,47)', color: 'white' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-90">Lab Orders</p>
                      <p className="text-2xl font-bold">{doctorAnalytics[0]?.with_laboratory_requests}</p>
                    </div>
                    <TestTube className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: 'rgb(198,200,202)', color: 'rgb(17,40,77)' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Lab Results</p>
                      <p className="text-2xl font-bold">{doctorAnalytics[0]?.lab_result}</p>
                    </div>
                    <FileText className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: 'rgb(198,200,202)', color: 'rgb(17,40,77)' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Prescriptions</p>
                      <p className="text-2xl font-bold">{Number(doctorAnalytics[0]?.with_pharmacy_requests) + Number(doctorAnalytics[0]?.with_nurse_requests)}</p>
                    </div>
                    <Pill className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
            </div>}

            {/* Patient Queue Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Patients Sent from Reception</span>
                  <Badge variant="secondary">{doctorRequests.length}</Badge>
                </CardTitle>
                <CardDescription>Students forwarded to you for consultation</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : doctorRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No patients in queue
                  </div>
                ) : (
                  <div className="space-y-4">
                    {doctorRequests.map((patient, index) => (
                      <div key={index}>
                        <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                          {/* Patient Info (Left Side) */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="font-bold text-gray-600">AT</span>
                              </div>
                              <div>
                                <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                                <p className="text-sm text-muted-foreground">{patient.student_id}</p>
                                <p className="text-sm text-muted-foreground">{patient.department} - Year {patient.year_of_study}</p>
                              </div>
                            </div>
                            <div className="mt-3">
                              <Label className="text-xs font-medium">Reception Notes:</Label>
                              <p className="text-sm mt-1">{patient.initial_notes || 'No notes provided'}</p>
                            </div>
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground">Sent at {new Date(patient.created_at).toLocaleTimeString()}</p>
                              <Badge
                                variant={patient.priority_level === 'urgent' ? 'destructive' : 'outline'}
                                className={patient.priority_level === 'urgent' ? 'bg-red-100 text-red-800' : ''}
                              >
                                {patient.priority_level}
                              </Badge>
                            </div>
                          </div>

                          {/* Action Buttons (Right Side - Vertical) */}
                          <div className="flex flex-col space-y-2 w-40">
                            <Button
                              size="sm"
                              variant={expandedPatient === patient.request_id ? 'default' : 'outline'}
                              className={`w-full ${expandedPatient === patient.request_id ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                              onClick={() => {
                                handleFetchPatientHistory(patient.request_id);
                                setExpandedPatient(expandedPatient === patient.request_id ? null : patient.request_id);
                              }}
                            >
                              View History
                            </Button>
                            {patient.status == "pending" && (
                              <Button
                                size="sm"
                                variant={expandedPatient === patient.request_id + '-consult' ? 'default' : 'outline'}
                                className={`w-full ${expandedPatient === patient.request_id + '-consult' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                                onClick={() => {
                                  if (expandedPatient === patient.request_id + '-consult') {
                                    setExpandedPatient(null);
                                  } else {
                                    setExpandedPatient(patient.request_id + '-consult');
                                  }
                                }}
                              >
                                {expandedPatient === patient.request_id + '-consult' ? 'Cancel Consult' : 'Start Consultation'}
                              </Button>)}
                            {patient.status == "with_lab" ? (<Button
                              size="sm"
                              variant={expandedPatient === patient.request_id + 'lab' ? 'default' : 'outline'}
                              className={`w-full ${expandedPatient === patient.request_id + 'lab' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                              onClick={() => {
                                if (expandedPatient === patient.request_id + 'lab') {
                                  setExpandedPatient(null);
                                  setLabResults(null); // Clear results when collapsing
                                } else {
                                  setExpandedPatient(patient.request_id + 'lab');
                                  handleFetchLabResult(patient.request_id.toString()); // Fetch lab results
                                }
                              }}
                            >
                              {expandedPatient === patient.request_id + 'lab' ? 'Cancel Lab' : 'Lab Result'}
                            </Button>) : (<Button
                              size="sm"
                              variant={expandedPatient === patient.request_id + '-lab' ? 'default' : 'outline'}
                              className={`w-full ${expandedPatient === patient.request_id + '-lab' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                              onClick={() => {
                                if (expandedPatient === patient.request_id + '-lab') {
                                  setExpandedPatient(null);
                                } else {
                                  setExpandedPatient(patient.request_id + '-lab');
                                }
                              }}
                            >
                              {expandedPatient === patient.request_id + '-lab' ? 'Cancel Lab' : 'Order Lab'}
                            </Button>)}
                            <Button
                              size="sm"
                              variant={expandedPatient === patient.request_id + '-prescribe' ? 'default' : 'outline'}
                              className={`w-full ${expandedPatient === patient.request_id + '-prescribe' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                              onClick={() => {
                                if (expandedPatient === patient.request_id + '-prescribe') {
                                  setExpandedPatient(null);
                                } else {
                                  setExpandedPatient(patient.request_id + '-prescribe');
                                }
                              }}
                            >
                              {expandedPatient === patient.request_id + '-prescribe' ? 'Cancel Prescribe' : 'Prescribe'}
                            </Button>
                          </div>
                        </div>

                        {/* Expandable Sections Below the Card */}
                        <div className="mt-2">
                          {/* Patient History */}
                          {expandedPatient === patient.request_id && (
                            <div className="p-4 bg-white rounded-lg border">
                              <h4 className="font-medium mb-3">Patient Medical History</h4>
                              <div className="max-h-60 overflow-y-auto space-y-3">
                                {patientHistory && patientHistory.length > 0 ? (
                                  patientHistory.map((visit: any, historyIndex: number) => (
                                    <div key={historyIndex} className="p-3 bg-gray-50 rounded border">
                                      <div className="flex items-center justify-between mb-2">
                                        <p className="font-medium text-sm">{new Date(visit.created_at).toLocaleDateString()}</p>
                                        <p className="text-xs text-muted-foreground">Doctor ID: {visit.doctor_first_name}</p>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                        <div>
                                          <Label className="text-xs font-medium">Complaint</Label>
                                          <p className="text-xs">{visit.complaint || 'N/A'}</p>
                                        </div>
                                        <div>
                                          <Label className="text-xs font-medium">Diagnosis</Label>
                                          <p className="text-xs">{visit.diagnosis || 'N/A'}</p>
                                        </div>
                                        <div>
                                          <Label className="text-xs font-medium">Treatment</Label>
                                          <p className="text-xs">{visit.treatment || 'N/A'}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-muted-foreground">No medical history found</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Consultation Form */}
                          {expandedPatient === patient.request_id + '-consult' && (
                            <div className="p-4 bg-white rounded-lg border">
                              <h4 className="font-medium mb-3">Consultation Form</h4>
                              <div className="space-y-4">
                                <div>
                                  <Label>Patient Complaint</Label>
                                  <Textarea
                                    placeholder="Enter the patient's primary complaint..."
                                    rows={4}
                                    className="mt-1"
                                    value={formData.complaint}
                                    onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label>Preliminary Observations</Label>
                                  <Textarea
                                    placeholder="Enter your initial observations..."
                                    rows={4}
                                    className="mt-1"
                                    value={formData.examination}
                                    onChange={(e) => setFormData({ ...formData, examination: e.target.value })}
                                  />
                                </div>
                                <div className="flex space-x-3">
                                  <Button
                                    className="bg-blue-600 hover:bg-blue-700"
                                    style={{ backgroundColor: 'rgb(17,40,77)' }}
                                    onClick={() => handleStartConsultation(patient.request_id, formData.complaint)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Submit Consultation
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setExpandedPatient(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Lab Order Form */}
                          {expandedPatient === patient.request_id + '-lab' && (
                            <div className="p-4 bg-white rounded-lg border">
                              <h4 className="font-medium mb-3">Lab Test Request</h4>
                              <div className="space-y-4">
                                <div>
                                  <Label>Select Lab Tests</Label>
                                  <div className="space-y-2 mt-2">
                                    {labTestOptions.map((option) => (
                                      <div key={option.value} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={option.value}
                                          checked={selectedLabTests.includes(option.value)}
                                          onCheckedChange={(checked) => {
                                            if (checked) {
                                              setSelectedLabTests([...selectedLabTests, option.value]);
                                            } else {
                                              setSelectedLabTests(selectedLabTests.filter(v => v !== option.value));
                                            }
                                          }}
                                        />
                                        <Label htmlFor={option.value}>{option.label}</Label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <Label>Clinical Notes (Optional)</Label>
                                  <Textarea
                                    placeholder="Additional clinical information for the lab..."
                                    rows={3}
                                    className="mt-1"
                                    value={formData.clinicalNotes}
                                    onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
                                  />
                                </div>
                                <div className="flex space-x-3">
                                  <Button
                                    className="bg-blue-600 hover:bg-blue-700"
                                    style={{ backgroundColor: 'rgb(17,40,77)' }}
                                    onClick={() => handleCreateLabOrder(patient.request_id, selectedLabTests, formData.clinicalNotes)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Submit Lab Request
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setExpandedPatient(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* lab result display */}

                          {/* Lab Results Display */}
                          {expandedPatient === patient.request_id + 'lab' && patient.status === 'with_lab' && (
                            <div className="p-4 bg-white rounded-lg border">
                              <h4 className="font-medium mb-3">Lab Results</h4>
                              {labResults && labResults.length > 0 ? (
                                <div className="space-y-3">
                                  {labResults.map((result, index) => (
                                    <div key={index} className="p-3 bg-gray-50 rounded border">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div>
                                          <Label className="text-xs font-medium">Request ID</Label>
                                          <p className="text-sm">{result.request_id}</p>
                                        </div>
                                        <div>
                                          <Label className="text-xs font-medium">Technician</Label>
                                          <p className="text-sm">{result.technician_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                          <Label className="text-xs font-medium">Lab Result</Label>
                                          <p className="text-sm">{result.lab_result}</p>
                                        </div>
                                        <div>
                                          <Label className="text-xs font-medium">Technical Notes</Label>
                                          <p className="text-sm">{result.technical_notes || 'None'}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-muted-foreground">No lab results available</p>
                              )}
                            </div>
                          )}

                          {/* Prescription Form */}
                          {expandedPatient === patient.request_id + '-prescribe' && (
                            <div className="p-4 bg-white rounded-lg border">
                              <h4 className="font-medium mb-3">Prescription Form</h4>
                              <div className="space-y-4">
                                <div>
                                  <Label>Diagnosis</Label>
                                  <Input
                                    placeholder="Enter diagnosis..."
                                    value={formData.diagnosis}
                                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                  />
                                </div>

                                <div>
                                  <Label>Prescription Details</Label>
                                  <div className="space-y-3 mt-2">
                                    {prescriptionDetails.map((item, index) => (
                                      <div key={index} className="p-3 border rounded-lg flex items-center justify-between">
                                        <div>
                                          <p className="font-medium">{item.medicine_name}</p>
                                          <p className="text-sm text-muted-foreground">
                                            {item.dosage} - {item.quantity} units - {item.instructions}
                                          </p>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removePrescriptionItem(index)}
                                        >
                                          <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                      </div>
                                    ))}

                                    <div className="p-3 border rounded-lg space-y-3">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div

                                        >
                                          <Label>Medicine Name</Label>
                                          <Select
                                            value={newPrescriptionItem.inventory_id}

                                            onValueChange={(value) => {
                                              const selectedMedicine = inventory.find(item => item.inventory_id === parseInt(value));
                                              setNewPrescriptionItem({
                                                ...newPrescriptionItem,
                                                inventory_id: value,
                                                medicine_name: selectedMedicine ? selectedMedicine.medicine_name : ''
                                              });
                                            }}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select a medicine" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {inventory.map((item) => (
                                                <SelectItem key={item.inventory_id} value={item.inventory_id.toString()}>
                                                  {item.medicine_name}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label>Dosage</Label>
                                          <Input
                                            placeholder="e.g., 500mg"
                                            value={newPrescriptionItem.dosage}
                                            onChange={(e) => setNewPrescriptionItem({ ...newPrescriptionItem, dosage: e.target.value })}
                                          />
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                          <Label>Quantity</Label>
                                          <Input
                                            type="number"
                                            placeholder="Number of units"
                                            value={newPrescriptionItem.quantity}
                                            onChange={(e) => setNewPrescriptionItem({ ...newPrescriptionItem, quantity: e.target.value })}
                                          />
                                        </div>
                                        <div>
                                          <Label>Instructions</Label>
                                          <Input
                                            placeholder="Usage instructions"
                                            value={newPrescriptionItem.instructions}
                                            onChange={(e) => setNewPrescriptionItem({ ...newPrescriptionItem, instructions: e.target.value })}
                                          />
                                        </div>
                                      </div>
                                      <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={addPrescriptionItem}
                                      >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Medicine
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex space-x-3">
                                  <Button
                                    className="bg-blue-600 hover:bg-blue-700"
                                    style={{ backgroundColor: 'rgb(17,40,77)' }}
                                    onClick={() => handleCreatePrescription(patient.request_id, formData.diagnosis, prescriptionDetails)}
                                    disabled={prescriptionDetails.length === 0}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Submit Prescription
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setExpandedPatient(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      case 'Lab Requests':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="h-5 w-5" />
                  <span>Send Lab Request</span>
                </CardTitle>
                <CardDescription>Send lab test request to laboratory</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Student ID Number</Label>
                  <Input
                    placeholder="Enter Student ID (e.g., AASTU001)"
                    value={formData.labStudentId || ''}
                    onChange={(e) => setFormData({ ...formData, labStudentId: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Select Lab Tests</Label>
                  <div className="space-y-2 mt-2">
                    {labTestOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.value}
                          checked={selectedLabTests.includes(option.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLabTests([...selectedLabTests, option.value]);
                            } else {
                              setSelectedLabTests(selectedLabTests.filter(v => v !== option.value));
                            }
                          }}
                        />
                        <Label htmlFor={option.value}>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Clinical Notes (Optional)</Label>
                  <Textarea
                    placeholder="Additional clinical information or special instructions..."
                    value={formData.labNotes || ''}
                    onChange={(e) => setFormData({ ...formData, labNotes: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button className="w-full">Send to Laboratory</Button>
              </CardContent>
            </Card>

            {/* Recently Sent Lab Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recently Sent Lab Requests</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      student: 'Alemayehu Tadesse (AASTU001)',
                      request: 'CBC, Blood Sugar Level',
                      sentTime: '10:30 AM',
                      status: 'Processing'
                    },
                    {
                      student: 'Hanan Mohammed (AASTU002)',
                      request: 'Urinalysis, Stool Test',
                      sentTime: '10:15 AM',
                      status: 'Sample Collected'
                    },
                    {
                      student: 'Dawit Bekele (AASTU003)',
                      request: 'Liver Function Test',
                      sentTime: '9:45 AM',
                      status: 'Results Ready'
                    }
                  ].map((request, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{request.student}</p>
                        <p className="text-xs text-muted-foreground">{request.request} • Sent at {request.sentTime}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          request.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            request.status === 'Sample Collected' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'Lab Results':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>New Lab Results</span>
                  <Badge variant="secondary">6</Badge>
                </CardTitle>
                <CardDescription>Latest lab results awaiting your review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      patient: 'Alemayehu Tadesse',
                      id: 'AASTU001',
                      test: 'Complete Blood Count (CBC)',
                      requestDate: '2024-01-15',
                      completedDate: '2024-01-16',
                      result: 'Normal',
                      urgency: 'routine',
                      values: {
                        hemoglobin: '14.2 g/dL',
                        hematocrit: '42%',
                        wbc: '7,200/μL',
                        platelets: '250,000/μL'
                      }
                    },
                    {
                      patient: 'Hanan Mohammed',
                      id: 'AASTU002',
                      test: 'Blood Glucose',
                      requestDate: '2024-01-15',
                      completedDate: '2024-01-16',
                      result: 'Elevated',
                      urgency: 'urgent',
                      values: {
                        glucose: '180 mg/dL',
                        normal: '70-100 mg/dL'
                      }
                    },
                    {
                      patient: 'Dawit Bekele',
                      id: 'AASTU003',
                      test: 'Liver Function Panel',
                      requestDate: '2024-01-14',
                      completedDate: '2024-01-16',
                      result: 'Abnormal',
                      urgency: 'urgent',
                      values: {
                        alt: '65 U/L',
                        ast: '58 U/L',
                        bilirubin: '2.1 mg/dL'
                      }
                    }
                  ].map((result, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div>
                              <p className="font-medium">{result.patient}</p>
                              <p className="text-sm text-muted-foreground">{result.id}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{result.test}</p>
                              <p className="text-xs text-muted-foreground">
                                Requested: {result.requestDate} • Completed: {result.completedDate}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                            {Object.entries(result.values).map(([key, value], valueIndex) => (
                              <div key={valueIndex} className="p-2 bg-gray-50 rounded">
                                <p className="text-xs font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                <p className="text-sm">{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Badge
                            variant={result.result === 'Normal' ? 'default' : 'destructive'}
                            className={
                              result.result === 'Normal' ? 'bg-green-100 text-green-800' :
                                result.result === 'Elevated' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                            }
                          >
                            {result.result}
                          </Badge>
                          <Button size="sm" onClick={() => setShowResponseFormForResult(showResponseFormForResult === index ? null : index)}>
                            Response
                          </Button>
                        </div>
                      </div>

                      {/* Response Form for This Specific Result */}
                      {showResponseFormForResult === index && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border-t">
                          <h4 className="font-medium mb-3">Lab Result Response</h4>
                          <div className="space-y-4">
                            <div>
                              <Label>Student ID Number</Label>
                              <Input
                                placeholder="Enter Student ID (e.g., AASTU001)"
                                value={formData.resultStudentId || ''}
                                onChange={(e) => setFormData({ ...formData, resultStudentId: e.target.value })}
                              />
                            </div>

                            <div>
                              <Label>Lab Request</Label>
                              <Textarea
                                placeholder="Enter your response to the lab request..."
                                value={formData.labResults || ''}
                                onChange={(e) => setFormData({ ...formData, labResults: e.target.value })}
                                rows={4}
                              />
                            </div>

                            <div className="flex space-x-4">
                              <Button className="flex-1">Submit Response</Button>
                              <Button variant="outline" className="flex-1" onClick={() => setShowResponseFormForResult(null)}>Cancel</Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Recently Reviewed Results</span>
                </CardTitle>
                <CardDescription>Lab results you've already processed today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      patient: 'Bethelhem Assefa (AASTU004)',
                      test: 'Urinalysis',
                      time: '10:30 AM',
                      action: 'Marked Normal',
                      result: 'Normal'
                    },
                    {
                      patient: 'Yonas Getachew (AASTU005)',
                      test: 'Lipid Profile',
                      time: '10:15 AM',
                      action: 'Prescribed Medication',
                      result: 'High Cholesterol'
                    },
                    {
                      patient: 'Meskerem Alemu (AASTU006)',
                      test: 'Thyroid Function',
                      time: '9:45 AM',
                      action: 'Scheduled Follow-up',
                      result: 'Borderline'
                    }
                  ].map((review, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{review.patient}</p>
                        <p className="text-xs text-muted-foreground">
                          {review.test} • {review.time} • Action: {review.action}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Reviewed
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'Nurse Requests':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Syringe className="h-5 w-5" />
                  <span>Send Nurse Request</span>
                </CardTitle>
                <CardDescription>Send nursing care request to nurse</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Student ID Number</Label>
                  <Input
                    placeholder="Enter Student ID (e.g., AASTU001)"
                    value={formData.nurseStudentId || ''}
                    onChange={(e) => setFormData({ ...formData, nurseStudentId: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Nurse Request Details</Label>
                  <Textarea
                    placeholder="Enter nursing care required (e.g., Injection administration, Wound dressing, Vital signs monitoring, etc.)..."
                    value={formData.nurseRequest || ''}
                    onChange={(e) => setFormData({ ...formData, nurseRequest: e.target.value })}
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Priority Level</Label>
                  <Select value={formData.nursePriority || ''} onValueChange={(value) => setFormData({ ...formData, nursePriority: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="immediate">Immediate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Additional Notes (Optional)</Label>
                  <Textarea
                    placeholder="Any additional instructions or clinical notes for the nurse..."
                    value={formData.nurseNotes || ''}
                    onChange={(e) => setFormData({ ...formData, nurseNotes: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button className="w-full">Send to Nurse</Button>
              </CardContent>
            </Card>

            {/* Recently Sent Nurse Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recently Sent Nurse Requests</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      student: 'Alemayehu Tadesse (AASTU001)',
                      request: 'Injection administration - Insulin',
                      sentTime: '10:30 AM',
                      status: 'Pending'
                    },
                    {
                      student: 'Hanan Mohammed (AASTU002)',
                      request: 'Vital signs monitoring',
                      sentTime: '10:15 AM',
                      status: 'Completed'
                    },
                    {
                      student: 'Dawit Bekele (AASTU003)',
                      request: 'Wound care and dressing',
                      sentTime: '9:45 AM',
                      status: 'In Progress'
                    }
                  ].map((request, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{request.student}</p>
                        <p className="text-xs text-muted-foreground">{request.request} • Sent at {request.sentTime}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'Pharmacy Requests':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Pill className="h-5 w-5" />
                  <span>Send Pharmacy Request</span>
                </CardTitle>
                <CardDescription>Send prescription request to pharmacy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Student ID Number</Label>
                  <Input
                    placeholder="Enter Student ID (e.g., AASTU001)"
                    value={formData.pharmacyStudentId || ''}
                    onChange={(e) => setFormData({ ...formData, pharmacyStudentId: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Prescribed Drugs</Label>
                  <Textarea
                    placeholder="Enter prescribed medications with dosage and instructions (e.g., Paracetamol 500mg - 2 tablets 3 times daily for 5 days)..."
                    value={formData.prescribedDrugs || ''}
                    onChange={(e) => setFormData({ ...formData, prescribedDrugs: e.target.value })}
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Diagnosis</Label>
                  <Input
                    placeholder="Enter diagnosis for pharmacy reference"
                    value={formData.pharmacyDiagnosis || ''}
                    onChange={(e) => setFormData({ ...formData, pharmacyDiagnosis: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Special Instructions</Label>
                  <Textarea
                    placeholder="Any special instructions for medication administration or patient counseling..."
                    value={formData.pharmacyInstructions || ''}
                    onChange={(e) => setFormData({ ...formData, pharmacyInstructions: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button className="w-full">Send to Pharmacy</Button>
              </CardContent>
            </Card>

            {/* Recently Sent Pharmacy Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recently Sent Pharmacy Requests</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      student: 'Alemayehu Tadesse (AASTU001)',
                      drugs: 'Paracetamol 500mg, Vitamin C',
                      sentTime: '10:30 AM',
                      status: 'Dispensed'
                    },
                    {
                      student: 'Hanan Mohammed (AASTU002)',
                      drugs: 'Antacid tablets, ORS',
                      sentTime: '10:15 AM',
                      status: 'Pending'
                    },
                    {
                      student: 'Dawit Bekele (AASTU003)',
                      drugs: 'Ibuprofen 400mg, Antibiotic cream',
                      sentTime: '9:45 AM',
                      status: 'In Preparation'
                    }
                  ].map((request, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{request.student}</p>
                        <p className="text-xs text-muted-foreground">{request.drugs} • Sent at {request.sentTime}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'Dispensed' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{moduleTitle}</CardTitle>
              <CardDescription>This module is under development</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Content for {moduleTitle} will be available soon.</p>
            </CardContent>
          </Card>
        );
    }
  };

  const renderLabModules = () => {
    switch (moduleKey) {
      case 'Doctor Requests':
        return (
          <div className="space-y-6">
            {/* Analytics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card style={{ backgroundColor: 'rgb(17,40,77)', color: 'white' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-90">Total Lab Orders</p>
                      <p className="text-2xl font-bold">{labOrders.length}</p>
                    </div>
                    <TestTube className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: 'rgb(174,138,47)', color: 'white' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-90">Completed Tests</p>
                      <p className="text-2xl font-bold">{labOrders.filter(o => o.status === 'completed').length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: 'rgb(198,200,202)', color: 'rgb(17,40,77)' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Pending Tests</p>
                      <p className="text-2xl font-bold">{labOrders.filter(o => o.status === 'pending').length}</p>
                    </div>
                    <Clock className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: 'rgb(198,200,202)', color: 'rgb(17,40,77)' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Urgent Requests</p>
                      <p className="text-2xl font-bold">{labOrders.filter(o => o.priority_level === 'urgent').length}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="h-5 w-5" />
                  <span>Lab Requests from Doctors</span>
                  <Badge variant="secondary">{labOrders.filter(o => o.status === 'pending').length} pending</Badge>
                </CardTitle>
                <CardDescription>Lab test requests sent from doctors</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : labOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No lab requests found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {labOrders.map((request, index) => (
                      <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <div>
                                <p className="font-medium">{request.first_name} {request.last_name}</p>
                                <p className="text-sm text-muted-foreground">{request.student_id}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">From: Dr. {request.doctor_id}</p>
                                <p className="text-xs text-muted-foreground">Requested at {new Date(request.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="mt-3">
                              <Label className="text-xs font-medium">Lab Tests Required:</Label>
                              <p className="text-sm mt-1">{request.lab_request}</p>
                            </div>
                            {request.clinical_notes && (
                              <div className="mt-2">
                                <Label className="text-xs font-medium">Clinical Notes:</Label>
                                <p className="text-sm mt-1">{request.clinical_notes}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Badge
                              variant={request.priority_level === 'urgent' ? 'destructive' : 'outline'}
                              className={request.priority_level === 'urgent' ? 'bg-red-100 text-red-800' : ''}
                            >
                              {request.priority_level}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  request.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                    'bg-green-100 text-green-800'
                              }
                            >
                              {request.status}
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => setShowResultForm(showResultForm === request.order_id ? null : request.order_id)}
                            >
                              {showResultForm === request.order_id ? 'Cancel' : 'Submit Result'}
                            </Button>
                          </div>
                        </div>

                        {showResultForm === request.order_id && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border-t">
                            <h4 className="font-medium mb-3">Lab Test Results</h4>
                            <div className="space-y-4">
                              <div>
                                <Label>Test Results</Label>
                                <Textarea
                                  placeholder="Enter detailed test results..."
                                  rows={6}
                                  value={formData.labResults}
                                  onChange={(e) => setFormData({ ...formData, labResults: e.target.value })}
                                />
                              </div>

                              <div>
                                <Label>Technician Notes (Optional)</Label>
                                <Textarea
                                  placeholder="Any additional notes or observations..."
                                  rows={3}
                                  value={formData.technicianNotes}
                                  onChange={(e) => setFormData({ ...formData, technicianNotes: e.target.value })}
                                />
                              </div>

                              <div className="flex space-x-3">
                                <Button
                                  className="flex-1"
                                  onClick={() => handleSubmitLabResult(request.order_id, formData.labResults, formData.technicianNotes)}
                                >
                                  Submit Results
                                </Button>
                                <Button
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => setShowResultForm(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      case 'Send Results':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Send Lab Results to Doctor</span>
                </CardTitle>
                <CardDescription>Send completed lab results back to doctor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Order ID</Label>
                  <Input
                    placeholder="Enter Order ID"
                    value={formData.resultOrderId || ''}
                    onChange={(e) => setFormData({ ...formData, resultOrderId: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Lab Results</Label>
                  <Textarea
                    placeholder="Enter lab test results with values and interpretations..."
                    value={formData.labResults || ''}
                    onChange={(e) => setFormData({ ...formData, labResults: e.target.value })}
                    rows={6}
                  />
                </div>

                <div>
                  <Label>Technician Notes (Optional)</Label>
                  <Textarea
                    placeholder="Any additional notes or observations..."
                    value={formData.technicianNotes || ''}
                    onChange={(e) => setFormData({ ...formData, technicianNotes: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button className="w-full">Send Results to Doctor</Button>
              </CardContent>
            </Card>

            {/* Recently Sent Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recently Sent Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      student: 'Alemayehu Tadesse (AASTU001)',
                      tests: 'CBC - Normal, Blood Sugar - 95 mg/dL',
                      sentTime: '11:30 AM',
                      doctor: 'Dr. Meron Desta'
                    },
                    {
                      student: 'Hanan Mohammed (AASTU002)',
                      tests: 'Liver Function - Elevated ALT, Kidney - Normal',
                      sentTime: '11:15 AM',
                      doctor: 'Dr. Tesfaye Haile'
                    },
                    {
                      student: 'Dawit Bekele (AASTU003)',
                      tests: 'Stool Test - No parasites, H. Pylori - Negative',
                      sentTime: '11:00 AM',
                      doctor: 'Dr. Rahel Wolde'
                    }
                  ].map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{result.student}</p>
                        <p className="text-xs text-muted-foreground">{result.tests}</p>
                        <p className="text-xs text-muted-foreground">Sent to {result.doctor} at {result.sentTime}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Sent
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{moduleTitle}</CardTitle>
              <CardDescription>This module is under development</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Content for {moduleTitle} will be available soon.</p>
            </CardContent>
          </Card>
        );
    }
  };

  const renderPharmacyModules = () => {
    switch (moduleKey) {
      case 'Doctor Requests':
        return (
          <div className="space-y-6">
            {/* Analytics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card style={{ backgroundColor: 'rgb(17,40,77)', color: 'white' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-90">Total Prescriptions</p>
                      <p className="text-2xl font-bold">{prescriptionRequests.length}</p>
                    </div>
                    <FileText className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: 'rgb(174,138,47)', color: 'white' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-90">Dispensed</p>
                      <p className="text-2xl font-bold">{prescriptionRequests.filter(p => p.status === 'dispensed').length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: 'rgb(198,200,202)', color: 'rgb(17,40,77)' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Pending</p>
                      <p className="text-2xl font-bold">{prescriptionRequests.filter(p => p.status === 'pending').length}</p>
                    </div>
                    <Clock className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: 'rgb(198,200,202)', color: 'rgb(17,40,77)' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Critical Stock</p>
                      <p className="text-2xl font-bold">3</p>
                    </div>
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Pill className="h-5 w-5" />
                  <span>Prescription Requests from Doctors</span>
                  <Badge variant="secondary">{prescriptionRequests.filter(p => p.status === 'pending').length} pending</Badge>
                </CardTitle>
                <CardDescription>Medication requests sent from doctors</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : prescriptionRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No prescription requests found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {prescriptionRequests.map((request, index) => (
                      <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-300">
                        <div className="p-5">
                          {/* Header with priority indicator */}
                          <div className="flex justify-between items-start mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${request.priority_level === 'High' ? 'bg-red-100 text-red-800' :
                              request.priority_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                              {request.priority_level || 'Normal'} Priority
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${request.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              request.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                              {request.status}
                            </span>
                          </div>

                          {/* Patient Information */}
                          <div className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">
                              {request.student_first_name} {request.student_last_name}
                            </h2>
                            <p className="text-sm text-gray-600">Student ID: {request.student_id}</p>
                          </div>

                          {/* Doctor Information */}
                          <div className="mb-4 flex items-center">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                              <i className="fas fa-user-md text-blue-600"></i>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Doctor</p>
                              <p className="font-medium">Dr. {request.doctor_first_name} {request.doctor_last_name}</p>
                            </div>
                          </div>



                          {/* Prescription Information */}
                          <div className="mb-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Prescription Details</h3>
                            {request.prescription_drug_id ? (
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="flex items-center mb-2">
                                  <i className="fas fa-pills text-blue-600 mr-2"></i>
                                  <span className="font-medium">{request.medicine_name}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-gray-600">Quantity:</span>
                                    <span className="ml-1 font-medium">{request.quantity} units</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Dosage:</span>
                                    <span className="ml-1 font-medium">{request.dosage_instructions || 'Not specified'}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-500 italic">No medications specified</p>
                            )}
                          </div>

                          {/* Date and Action Button */}
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                              {new Date(request.created_at).toLocaleString()}
                            </p>
                            <button
                              onClick={() => openModal(request.inventory_id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                            >
                              <i className="fas fa-check-circle mr-2"></i>
                              dispense
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}



                    {/* Modal for Inventory Details */}
                    {isModalOpen && selectedInventory && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
                          <h2 className="text-lg font-semibold text-gray-800 mb-4">Inventory Details</h2>
                          <div className="space-y-3">
                            <p>
                              <span className="text-gray-600 font-medium">Medicine Name:</span>{' '}
                              {selectedInventory[0].medicine_name}
                            </p>
                            <p>
                              <span className="text-gray-600 font-medium">Category:</span>{' '}
                              {selectedInventory[0].category}
                            </p>
                            <p>
                              <span className="text-gray-600 font-medium">StockQuantity:</span>{' '}
                              {selectedInventory[0].quantity} units
                            </p>
                            <p>
                              <span className="text-gray-600 font-medium">Minimum Stock:</span>{' '}
                              {selectedInventory[0].min_stock} units
                            </p>

                            <p>
                              <span className="text-gray-600 font-medium">Expiry Date:</span>{' '}
                              {new Date(selectedInventory[0].expiry_date).toLocaleString()}
                            </p>
                            <p>
                              <span className="text-gray-600 font-medium">Created At:</span>{' '}
                              {new Date(selectedInventory[0].created_at).toLocaleString()}
                            </p>
                            <p>
                              <span className="text-gray-600 font-medium">Updated At:</span>{' '}
                              {new Date(selectedInventory[0].updated_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="mt-6 flex justify-end space-x-3">
                            <button
                              onClick={closeModal}
                              className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {


                              
                                handleDispenseMedication(
                                  prescriptionRequests.find((req) => req.inventory_id === selectedInventory[0].inventory_id)
                                    ?.prescription_drug_id,
                                  prescriptionRequests.find((req) => req.inventory_id === selectedInventory[0].inventory_id)
                                    ?.quantity,
                                  'pharmacy dispensed'
                                )
                              }
                              }
                              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                            >
                              <i className="fas fa-check-circle mr-2"></i>
                              Confirm Done
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dispensed Medications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Dispensed Today</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {prescriptionRequests
                    .filter(p => p.status === 'dispensed')
                    .slice(0, 3)
                    .map((dispensed, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{dispensed.first_name} {dispensed.last_name} ({dispensed.student_id})</p>
                          <p className="text-xs text-muted-foreground">
                            {dispensed.prescription_drugs.map((d: any) => d.medicine_name).join(', ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Dispensed at {new Date(dispensed.updated_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          Dispensed
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{moduleTitle}</CardTitle>
              <CardDescription>This module is under development</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Content for {moduleTitle} will be available soon.</p>
            </CardContent>
          </Card>
        );
    }
  };

  const renderNurseModules = () => {
    switch (moduleKey) {
      case 'Doctor Requests':
        return (
          <div className="space-y-6">
            {/* Analytics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card style={{ backgroundColor: 'rgb(17,40,77)', color: 'white' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-90">Total Requests</p>
                      <p className="text-2xl font-bold">{nurseRequests.length}</p>
                    </div>
                    <Syringe className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: 'rgb(174,138,47)', color: 'white' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-90">Completed</p>
                      <p className="text-2xl font-bold">{nurseRequests.filter(r => r.status === 'completed').length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: 'rgb(198,200,202)', color: 'rgb(17,40,77)' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Pending</p>
                      <p className="text-2xl font-bold">{nurseRequests.filter(r => r.status === 'pending').length}</p>
                    </div>
                    <Clock className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: 'rgb(198,200,202)', color: 'rgb(17,40,77)' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Urgent</p>
                      <p className="text-2xl font-bold">{nurseRequests.filter(r => r.priority_level === 'urgent').length}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Syringe className="h-5 w-5" />
                  <span>Nursing Requests from Doctors</span>
                  <Badge variant="secondary">{nurseRequests.filter(r => r.status === 'pending').length} pending</Badge>
                </CardTitle>
                <CardDescription>Nursing care requests sent from doctors</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : nurseRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No nursing requests found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {nurseRequests.map((request, index) => (
                      <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-300">
                        <div className="p-5">
                          {/* Header with priority indicator */}
                          <div className="flex justify-between items-start mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${request.priority_level === 'High' ? 'bg-red-100 text-red-800' :
                              request.priority_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                              {request.priority_level || 'Normal'} Priority
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${request.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              request.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                              {request.status}
                            </span>
                          </div>

                          {/* Patient Information */}
                          <div className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">
                              {request.student_first_name} {request.student_last_name}
                            </h2>
                            <p className="text-sm text-gray-600">Student ID: {request.student_id}</p>
                          </div>

                          {/* Doctor Information */}
                          <div className="mb-4 flex items-center">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                              <i className="fas fa-user-md text-blue-600"></i>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Doctor</p>
                              <p className="font-medium">Dr. {request.doctor_first_name} {request.doctor_last_name}</p>
                            </div>
                          </div>

                          {/* Instructions */}
                          <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">Nurse Instructions</h3>
                            <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                              {request.nurse_request || 'No specific instructions provided'}
                            </p>
                          </div>

                          {/* Prescription Information */}
                          <div className="mb-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Prescription Details</h3>
                            {request.prescription_drug_id ? (
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="flex items-center mb-2">
                                  <i className="fas fa-pills text-blue-600 mr-2"></i>
                                  <span className="font-medium">{request.medicine_name}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-gray-600">Quantity:</span>
                                    <span className="ml-1 font-medium">{request.quantity} units</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Dosage:</span>
                                    <span className="ml-1 font-medium">{request.dosage_instructions || 'Not specified'}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-500 italic">No medications specified</p>
                            )}
                          </div>

                          {/* Date and Action Button */}
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                              {new Date(request.created_at).toLocaleString()}
                            </p>
                            <button
                              onClick={() => handleDispenseMedication(request.prescription_drug_id, request.quantity, 'dispensed by nurse')}
                              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                            >
                              <i className="fas fa-check-circle mr-2"></i>
                              Confirm Done
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Completed Tasks Today</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nurseRequests
                    .filter(r => r.status === 'completed')
                    .slice(0, 3)
                    .map((task, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{task.first_name} {task.last_name} ({task.student_id})</p>
                          <p className="text-xs text-muted-foreground">{task.nurse_request}</p>
                          <p className="text-xs text-muted-foreground">
                            Completed at {new Date(task.updated_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{moduleTitle}</CardTitle>
              <CardDescription>This module is under development</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Content for {moduleTitle} will be available soon.</p>
            </CardContent>
          </Card>
        );
    }
  };

  const renderPatientModules = () => {
    switch (moduleKey) {
      case 'Book Appointment':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Book New Appointment</span>
              </CardTitle>
              <CardDescription>Request follow-up appointments after your clinic visit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Preferred Date</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Reason for Visit</Label>
                <Textarea placeholder="Describe your symptoms or reason for follow-up visit..." />
              </div>
              <div>
                <Label>Previous Visit Reference</Label>
                <Input placeholder="Enter your previous visit code (optional)" />
              </div>
              <Button className="w-full">Request Appointment</Button>
            </CardContent>
          </Card>
        );
      case 'Medical History':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Your Medical History</span>
              </CardTitle>
              <CardDescription>View your past clinic visits and treatments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: '2024-01-15', doctor: 'Dr. Meron Desta', diagnosis: 'Common Cold', status: 'Completed' },
                  { date: '2024-01-20', doctor: 'Dr. Tesfaye Haile', diagnosis: 'Follow-up Check', status: 'Completed' }
                ].map((visit, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{visit.date}</p>
                        <p className="text-sm text-muted-foreground">Consulted with {visit.doctor}</p>
                        <p className="text-sm">{visit.diagnosis}</p>
                      </div>
                      <Badge variant="outline">{visit.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'Test Results':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="h-5 w-5" />
                <span>Your Test Results</span>
              </CardTitle>
              <CardDescription>View lab test results from your clinic visits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { test: 'Blood Test', date: '2024-01-16', status: 'Normal', doctor: 'Dr. Meron Desta' },
                  { test: 'Urine Test', date: '2024-01-16', status: 'Normal', doctor: 'Dr. Meron Desta' }
                ].map((result, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{result.test}</p>
                        <p className="text-sm text-muted-foreground">Date: {result.date}</p>
                        <p className="text-sm text-muted-foreground">Ordered by: {result.doctor}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">{result.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'Prescriptions':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Pill className="h-5 w-5" />
                <span>Your Prescriptions</span>
              </CardTitle>
              <CardDescription>View current and past prescriptions from your visits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    medication: 'Paracetamol 500mg',
                    dosage: '2 tablets, 3 times daily',
                    duration: '7 days',
                    status: 'Active',
                    doctor: 'Dr. Meron Desta'
                  },
                  {
                    medication: 'Vitamin C 1000mg',
                    dosage: '1 tablet daily',
                    duration: '30 days',
                    status: 'Completed',
                    doctor: 'Dr. Meron Desta'
                  }
                ].map((prescription, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{prescription.medication}</p>
                      <Badge variant={prescription.status === 'Active' ? 'default' : 'secondary'}>
                        {prescription.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><strong>Dosage:</strong> {prescription.dosage}</p>
                      <p><strong>Duration:</strong> {prescription.duration}</p>
                      <p><strong>Prescribed by:</strong> {prescription.doctor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{moduleTitle}</CardTitle>
              <CardDescription>This module is under development</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Content for {moduleTitle} will be available soon.</p>
            </CardContent>
          </Card>
        );
    }
  };

  const filteredUsers = users.filter(user =>
    user.first_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.department?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const filteredStudents = students.filter(student => {
    return (
      (!studentFilters.department || student.department === studentFilters.department) &&
      (!studentFilters.year || student.year_of_study.toString() == studentFilters.year) &&
      (!studentFilters.visitStatus || student.visitStatus === studentFilters.visitStatus)
    );
  });

  const filteredInventory = inventory.filter(item => {
    return (
      (!inventoryFilters.category || item.category === inventoryFilters.category) &&
      (!inventoryFilters.status ||
        (inventoryFilters.status === 'In Stock' && item.quantity > item.min_stock) ||
        (inventoryFilters.status === 'Low Stock' && item.quantity > 0 && item.quantity <= item.min_stock) ||
        (inventoryFilters.status === 'Out of Stock' && item.quantity === 0)
      )
    );
  });

  const roleColors: Record<string, string> = {
    doctor: 'bg-green-100 text-green-800 border-green-200',
    nurse: 'bg-pink-100 text-pink-800 border-pink-200',
    lab_technician: 'bg-purple-100 text-purple-800 border-purple-200',
    pharmacy: 'bg-orange-100 text-orange-800 border-orange-200',
    receptionist: 'bg-blue-100 text-blue-800 border-blue-200',
    admin: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusColors: Record<string, string> = {
    Active: 'bg-green-100 text-green-800',
    Inactive: 'bg-gray-100 text-gray-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Suspended: 'bg-red-100 text-red-800'
  };

  const renderAdminModules = () => {
    switch (moduleKey) {
      case 'User Management':
        return (
          <div className="space-y-6">
            {/* Header with Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <Card style={{ backgroundColor: 'rgb(17,40,77)', color: 'white' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-90">Total Users</p>
                      <p className="text-2xl font-bold">{users.length}</p>
                    </div>
                    <Users className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>
              <Card style={{ backgroundColor: 'rgb(174,138,47)', color: 'white' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-90">Total Students</p>
                      <p className="text-2xl font-bold">{students.length}</p>
                    </div>
                    <Users className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>
              <Card style={{ backgroundColor: 'rgb(198,200,202)', color: 'rgb(17,40,77)' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Doctors</p>
                      <p className="text-2xl font-bold">{users.filter(u => u.role === 'doctor').length}</p>
                    </div>
                    <Stethoscope className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
              <Card style={{ backgroundColor: 'rgb(198,200,202)', color: 'rgb(17,40,77)' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Nurses</p>
                      <p className="text-2xl font-bold">{users.filter(u => u.role === 'nurse').length}</p>
                    </div>
                    <Syringe className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
              <Card style={{ backgroundColor: 'rgb(198,200,202)', color: 'rgb(17,40,77)' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Lab Techs</p>
                      <p className="text-2xl font-bold">{users.filter(u => u.role === 'lab_technician').length}</p>
                    </div>
                    <TestTube className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
              <Card style={{ backgroundColor: 'rgb(198,200,202)', color: 'rgb(17,40,77)' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Pharmacy</p>
                      <p className="text-2xl font-bold">{users.filter(u => u.role === 'pharmacy').length}</p>
                    </div>
                    <Pill className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
              <Card style={{ backgroundColor: 'rgb(198,200,202)', color: 'rgb(17,40,77)' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Reception</p>
                      <p className="text-2xl font-bold">{users.filter(u => u.role === 'reception').length}</p>
                    </div>
                    <Search className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>User & Role Management</span>
                  </div>
                  <Button
                    onClick={() => {
                      if (setSelectedModule) {
                        const expandEvent = new CustomEvent('expandUserManagement');
                        window.dispatchEvent(expandEvent);
                        setSelectedModule('Add New User');
                      }
                    }}
                    style={{ backgroundColor: 'rgb(174,138,47)' }}
                    className="hover:opacity-90"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New User
                  </Button>
                </CardTitle>
                <CardDescription>Manage system users and assign roles for AASTU Clinical Management System</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search users by name, email, role, or department..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {/* Users Table */}
                <div className="space-y-4">
                  {filteredUsers.map((user, index) => (
                    <div key={index} className="p-4 border rounded-xl hover:bg-gray-50 transition-all duration-200 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                            <span className="font-bold text-gray-700 text-lg">
                              {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                            </span>
                          </div>

                          {/* User Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="font-semibold text-lg">{user.first_name} {user.last_name}</h3>
                              <Badge className={`${roleColors[user.role]} text-xs font-medium`}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </Badge>
                              <Badge variant="outline" className={`${statusColors[user.is_active ? 'Active' : 'Inactive']} text-xs`}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{user.department || 'No department'}</span>
                              <span>•</span>
                              <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>Last Login: {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowRoleChangeForm(true);
                            }}
                            style={{ borderColor: 'rgb(17,40,77)', color: 'rgb(17,40,77)' }}
                            className="hover:opacity-80"
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Change Role
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            style={{
                              borderColor: user.is_active ? 'rgb(174,138,47)' : 'rgb(17,40,77)',
                              color: user.is_active ? 'rgb(174,138,47)' : 'rgb(17,40,77)'
                            }}
                            className="hover:opacity-80"
                            onClick={() => handleUpdateUserStatus(user.user_id, !user.is_active)}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Role Assignment Form Modal */}
            {showRoleChangeForm && selectedUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Change User Role</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowRoleChangeForm(false)}>
                      ×
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Assign a new role to {selectedUser.first_name} {selectedUser.last_name}</p>

                  <div className="space-y-4">
                    <div>
                      <Label>Current Role</Label>
                      <div className="mt-1">
                        <Badge className={`${roleColors[selectedUser.role]} text-sm py-1 px-3`}>
                          {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label>New Role</Label>
                      <Select value={formData.newRole || ''} onValueChange={(value) => setFormData({ ...formData, newRole: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select new role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reception">reception</SelectItem>
                          <SelectItem value="doctor">doctor</SelectItem>
                          <SelectItem value="nurse">nurse</SelectItem>
                          <SelectItem value="lab_technician">lab_technician</SelectItem>
                          <SelectItem value="pharmacy">pharmacy</SelectItem>
                          <SelectItem value="admin">admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Reason for Change</Label>
                      <Textarea
                        placeholder="Explain why this role change is necessary..."
                        value={formData.roleChangeReason || ''}
                        onChange={(e) => setFormData({ ...formData, roleChangeReason: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleUpdateUserRole(selectedUser.user_id, formData.newRole)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Change
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => setShowRoleChangeForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'Add New User':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Add New User</span>
              </CardTitle>
              <CardDescription>Create a new user account and assign role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>First Name</Label>
                  <Input
                    placeholder="Enter first name"
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    placeholder="Enter last name"
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="user@aastu.edu.et"
                  value={formData.userEmail || ''}
                  onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={formData.userPassword || ''}
                  onChange={(e) => setFormData({ ...formData, userPassword: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Assign Role</Label>
                <Select value={formData.userRole || ''} onValueChange={(value) => setFormData({ ...formData, userRole: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receptionist">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Receptionist</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="doctor">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Doctor</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="nurse">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                        <span>Nurse</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="lab_technician">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span>Lab Technician</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="pharmacy">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span>Pharmacy</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button
                  className="w-full hover:opacity-90"
                  size="lg"
                  style={{ backgroundColor: 'rgb(17,40,77)' }}
                  onClick={handleCreateUser}
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Create User Account
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case 'Students':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Student Management</span>
              </CardTitle>
              <CardDescription>View and manage student records</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label>Filter by Department</Label>
                  <Select value={studentFilters.department || 'all'} onValueChange={(value) => setStudentFilters({ ...studentFilters, department: value === 'all' ? '' : value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {filteredStudents.map( student => (
                        <SelectItem key={student.student_id} value={student.department}>{student.department }</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Filter by Year of Study</Label>
                  <Select value={studentFilters.year || 'all'} onValueChange={(value) => setStudentFilters({ ...studentFilters, year: value === 'all' ? '' : value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      <SelectItem value="1">Year 1</SelectItem>
                      <SelectItem value="2">Year 2</SelectItem>
                      <SelectItem value="3">Year 3</SelectItem>
                      <SelectItem value="4">Year 4</SelectItem>
                      <SelectItem value="5">Year 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Filter by Visit Status</Label>
                  <Select value={studentFilters.visitStatus || 'all'} onValueChange={(value) => setStudentFilters({ ...studentFilters, visitStatus: value === 'all' ? '' : value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Visited">Visited</SelectItem>
                      <SelectItem value="Not Visited">Not Visited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Students Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead style={{ backgroundColor: 'rgb(17,40,77)', color: 'white' }}>
                    <tr>
                      <th className="text-left p-3 font-medium">First Name</th>
                      <th className="text-left p-3 font-medium">Last Name</th>
                      <th className="text-left p-3 font-medium">Student ID</th>
                      <th className="text-left p-3 font-medium">Department</th>
                      <th className="text-left p-3 font-medium">Year of Study</th>
                      <th className="text-left p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => (
                      <tr key={student.student_id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-3">{student.first_name}</td>
                        <td className="p-3">{student.last_name}</td>
                        <td className="p-3 font-mono text-sm">{student.student_id}</td>
                        <td className="p-3">{student.department}</td>
                        <td className="p-3">Year {student.year_of_study}</td>
                        <td className="p-3">
                          <Badge
                            className={student.visitStatus === 'Visited' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {student.visitStatus}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredStudents.length} of {students.length} students
              </div>
            </CardContent>
          </Card>
        );
      case 'Inventory Management':
        return (
          <div className="space-y-6">
            {/* Analytics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card style={{ backgroundColor: 'rgb(17,40,77)', color: 'white' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-90">Total Items</p>
                      <p className="text-2xl font-bold">{inventory.length}</p>
                    </div>
                    <Settings className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>
              <Card style={{ backgroundColor: 'rgb(174,138,47)', color: 'white' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-90">Low Stock</p>
                      <p className="text-2xl font-bold">{inventory.filter(i => i.quantity > 0 && i.quantity <= i.min_stock).length}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>
              <Card style={{ backgroundColor: 'rgb(198,200,202)', color: 'rgb(17,40,77)' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Out of Stock</p>
                      <p className="text-2xl font-bold">{inventory.filter(i => i.quantity === 0).length}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
              <Card style={{ backgroundColor: 'rgb(198,200,202)', color: 'rgb(17,40,77)' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">In Stock</p>
                      <p className="text-2xl font-bold">{inventory.filter(i => i.quantity > i.min_stock).length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Inventory Management</span>
                  </div>
                  <Button
                    onClick={() => {
                      if (setSelectedModule) {
                        const expandEvent = new CustomEvent('expandInventoryManagement');
                        window.dispatchEvent(expandEvent);
                        setSelectedModule('Add New Inventory');
                      }
                    }}
                    style={{ backgroundColor: 'rgb(174,138,47)' }}
                    className="hover:opacity-90"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New Inventory
                  </Button>
                </CardTitle>
                <CardDescription>Manage clinic inventory and medical supplies</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label>Filter by Category</Label>
                    <Select value={inventoryFilters.category || 'all'} onValueChange={(value) => setInventoryFilters({ ...inventoryFilters, category: value === 'all' ? '' : value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {inventoryCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Filter by Stock Status</Label>
                    <Select value={inventoryFilters.status || 'all'} onValueChange={(value) => setInventoryFilters({ ...inventoryFilters, status: value === 'all' ? '' : value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="In Stock">In Stock</SelectItem>
                        <SelectItem value="Low Stock">Low Stock</SelectItem>
                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Inventory Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead style={{ backgroundColor: 'rgb(17,40,77)', color: 'white' }}>
                      <tr>
                        <th className="text-left p-3 font-medium">Medicine/Item</th>
                        <th className="text-left p-3 font-medium">Category</th>
                        <th className="text-left p-3 font-medium">Quantity</th>
                        <th className="text-left p-3 font-medium">Min Stock</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.map((item, index) => (
                        <tr key={item.inventory_id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{item.medicine_name}</p>
                              {item.expiry_date && (
                                <p className="text-xs text-muted-foreground">Expires: {new Date(item.expiry_date).toLocaleDateString()}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-3">{item.category}</td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                value={item.quantity}
                                className="w-20 h-8 text-sm"
                                onChange={(e) => {
                                  const newQuantity = parseInt(e.target.value);
                                  if (!isNaN(newQuantity)) {
                                    handleUpdateInventoryItem(item.inventory_id, { ...item, quantity: newQuantity });
                                  }
                                }}
                              />
                              <span className="text-xs text-gray-500">{item.unit}</span>
                            </div>
                          </td>
                          <td className="p-3">{item.min_stock} {item.unit}</td>
                          <td className="p-3">
                            <Badge
                              className={
                                item.quantity > item.min_stock ? 'bg-green-100 text-green-800' :
                                  item.quantity > 0 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                              }
                            >
                              {item.quantity > item.min_stock ? 'In Stock' :
                                item.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs"
                                onClick={() => {
                                  // Edit functionality would go here
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs text-red-600 border-red-200"
                                onClick={() => handleDeleteInventoryItem(item.inventory_id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  Showing {filteredInventory.length} of {inventory.length} inventory items
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'Add New Inventory':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Add New Inventory Item</span>
              </CardTitle>
              <CardDescription>Add new medicines and medical supplies to inventory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Item Name</Label>
                  <Input
                    placeholder="Enter medicine/item name"
                    value={formData.itemName || ''}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={formData.itemCategory || ''} onValueChange={(value) => setFormData({ ...formData, itemCategory: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    placeholder="Enter quantity"
                    value={formData.itemQuantity || ''}
                    onChange={(e) => setFormData({ ...formData, itemQuantity: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Minimum Stock</Label>
                  <Input
                    type="number"
                    placeholder="Minimum stock level"
                    value={formData.itemMinStock || ''}
                    onChange={(e) => setFormData({ ...formData, itemMinStock: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Select value={formData.itemUnit || ''} onValueChange={(value) => setFormData({ ...formData, itemUnit: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tablets">Tablets</SelectItem>
                      <SelectItem value="capsules">Capsules</SelectItem>
                      <SelectItem value="vials">Vials</SelectItem>
                      <SelectItem value="pieces">Pieces</SelectItem>
                      <SelectItem value="strips">Strips</SelectItem>
                      <SelectItem value="bottles">Bottles</SelectItem>
                      <SelectItem value="packs">Packs</SelectItem>
                      <SelectItem value="boxes">Boxes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Expiry Date (Optional)</Label>
                  <Input
                    type="date"
                    value={formData.itemExpiry || ''}
                    onChange={(e) => setFormData({ ...formData, itemExpiry: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Supplier (Optional)</Label>
                  <Input
                    placeholder="Enter supplier name"
                    value={formData.itemSupplier || ''}
                    onChange={(e) => setFormData({ ...formData, itemSupplier: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Price (Optional)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter price per unit"
                  value={formData.itemPrice || ''}
                  onChange={(e) => setFormData({ ...formData, itemPrice: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="pt-4">
                <Button
                  className="w-full hover:opacity-90"
                  size="lg"
                  style={{ backgroundColor: 'rgb(17,40,77)' }}
                  onClick={handleCreateInventoryItem}
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Add to Inventory
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case 'Upload':
                return (
            <div className="p-4">
              <h1 className="text-xl font-bold mb-4">Upload Students CSV</h1>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="border p-2 rounded"
              />
              <button
                onClick={handleUpload}
                className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Upload
              </button>

              {message && <p className="mt-4 text-green-600">{message}</p>}

              {errors.length > 0 && (
                <div className="mt-2 text-red-600">
                  <p>Errors:</p>
                  <ul className="list-disc pl-5">
                    {errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{moduleTitle}</CardTitle>
              <CardDescription>This module is under development</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Content for {moduleTitle} will be available soon.</p>
            </CardContent>
          </Card>
        );
    }
  };

  const renderContent = () => {
    switch (role) {
      case 'reception':
        return renderReceptionistModules();
      case 'doctor':
        return renderDoctorModules();
      case 'lab_technician':
        return renderLabModules();
      case 'pharmacy':
        return renderPharmacyModules();
      case 'nurse':
        return renderNurseModules();
      case 'patient':
        return renderPatientModules();
      case 'admin':
        return renderAdminModules();
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{moduleTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Module content not available.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{moduleTitle}</h2>
        <p className="text-muted-foreground">Manage your {moduleTitle.toLowerCase()} tasks</p>
      </div>
      {renderContent()}
    </div>
  );
}