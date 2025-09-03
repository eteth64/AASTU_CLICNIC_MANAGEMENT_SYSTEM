import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserRole, User, DashboardStats } from '@shared/types';
import ModuleContent from '@/components/ModuleContent';
import {
  Stethoscope,
  Users,
  Calendar,
  FileText,
  TestTube,
  Pill,
  Syringe,
  Settings,
  LogOut,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  UserPlus,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    dailyVisits: 0,
    pendingAppointments: 0,
    activeTreatments: 0,
    labTestsPending: 0,
    prescriptionsPending: 0,
    totalStudents: 0,
    doctors: 0,
    receptions: 0,
    nurses: 0,
    lab_technicians: 0,
    pharmacists: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('acms-token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('acms-user', JSON.stringify(userData));

        // Set default module based on role
        if (!selectedModule && userData.role) {
          const defaultModules: Record<UserRole, string> = {
            reception: 'Student Search',
            doctor: 'Patient Queue',
            lab_technician: 'Doctor Requests',
            pharmacy: 'Doctor Requests',
            nurse: 'Doctor Requests',
            patient: 'Book Appointment',
            admin: 'User Management'
          };
          setSelectedModule(defaultModules[userData.role as UserRole] || 'Student Search');
        }

        // Fetch dashboard stats for admin
        if (userData.role === 'admin') {
          fetchDashboardStats(token);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('acms-token');
        localStorage.removeItem('acms-user');
        navigate('/login');
      }
    };

    fetchUserData();

    // Listen for expand User Management event
    const handleExpandUserManagement = () => {
      setExpandedSections(prev => ({
        ...prev,
        'User Management': true
      }));
    };

    // Listen for expand Inventory Management event
    const handleExpandInventoryManagement = () => {
      setExpandedSections(prev => ({
        ...prev,
        'Inventory Management': true
      }));
    };

    window.addEventListener('expandUserManagement', handleExpandUserManagement);
    window.addEventListener('expandInventoryManagement', handleExpandInventoryManagement);

    return () => {
      window.removeEventListener('expandUserManagement', handleExpandUserManagement);
      window.removeEventListener('expandInventoryManagement', handleExpandInventoryManagement);
    };
  }, [navigate, selectedModule]);

  const fetchDashboardStats = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({
          ...prev,
          totalPatients: data.total_students || 0,
          doctors: data.doctors || 0,
          receptions: data.receptions || 0,
          nurses: data.nurses || 0,
          lab_technicians: data.lab_technicians || 0,
          pharmacists: data.pharmacists || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('acms-user');
    localStorage.removeItem('acms-token');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-800">Loading...</h1>
        </div>
      </div>
    );
  }

  const moduleCards: Record<string, Array<{ title: string; description: string; icon: any; link: string; badge?: string; expandable?: boolean; subItems?: any[] }>> = {
    reception: [
      { title: 'Student Search', description: 'Search student by ID and view history', icon: Search, link: '/reception/student-search' },
      { title: 'Send to Doctor', description: 'Forward student to doctor consultation', icon: FileText, link: '/reception/send-doctor' }
    ],
    doctor: [
      { title: 'Patient Queue', description: 'View patients sent from reception', icon: Users, link: '/doctor/patient-queue' },
      { title: 'Lab Requests', description: 'Send lab test requests', icon: TestTube, link: '/doctor/lab-requests' },
      { title: 'Lab Results', description: 'View lab results from laboratory', icon: FileText, link: '/doctor/lab-results' },
      { title: 'Nurse Requests', description: 'Send requests to nurse', icon: Syringe, link: '/doctor/nurse-requests' },
      { title: 'Pharmacy Requests', description: 'Send prescription requests', icon: Pill, link: '/doctor/pharmacy-requests' }
    ],
    lab_technician: [
      { title: 'Doctor Requests', description: 'View lab requests from doctors', icon: TestTube, link: '/lab/doctor-requests', badge: stats.labTestsPending.toString() },
      { title: 'Send Results', description: 'Send lab results back to doctor', icon: FileText, link: '/lab/send-results' }
    ],
    pharmacy: [
      { title: 'Doctor Requests', description: 'View prescription requests from doctors', icon: Pill, link: '/pharmacy/doctor-requests', badge: stats.prescriptionsPending.toString() },

    ],
    nurse: [
      { title: 'Doctor Requests', description: 'View requests from doctors', icon: Syringe, link: '/nurse/doctor-requests' },

    ],
    patient: [
      { title: 'Book Appointment', description: 'Request new appointment', icon: Calendar, link: '/patient/book-appointment' },
      { title: 'Medical History', description: 'View past consultations', icon: FileText, link: '/patient/history' },
      { title: 'Test Results', description: 'View lab test results', icon: TestTube, link: '/patient/test-results' },
      { title: 'Prescriptions', description: 'View current prescriptions', icon: Pill, link: '/patient/prescriptions' }
    ],
    admin: [
      {
        title: 'User Management', description: 'Manage system users & roles', icon: Users, link: '/admin/users', expandable: true, subItems: [
          { title: 'Add New User', description: 'Create new user accounts', icon: UserPlus, link: '/admin/add-user' }
        ]
      },
      { title: 'Students', description: 'View and manage student records', icon: Users, link: '/admin/students' },
      {
        title: 'Inventory Management', description: 'Manage clinic inventory', icon: Settings, link: '/admin/inventory', expandable: true, subItems: [
          { title: 'Add New Inventory', description: 'Add new inventory items', icon: Settings, link: '/admin/add-inventory' }
        ]
      }
    ]
  };

  const roleColors: Record<string, string> = {
    reception: 'bg-blue-100 text-blue-800',
    doctor: 'bg-green-100 text-green-800',
    lab_technician: 'bg-purple-100 text-purple-800',
    pharmacy: 'bg-orange-100 text-orange-800',
    nurse: 'bg-pink-100 text-pink-800',
    patient: 'bg-gray-100 text-gray-800',
    admin: 'bg-red-100 text-red-800'
  };

  const userModules = moduleCards[user.role] || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white rounded-lg">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fa3dc11a7ad994b56bcf82ac39d4f2ffc%2F8602705028f84a3a9443653bc109ca4e?format=webp&width=800"
                alt="AASTU Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">ACMS Dashboard</h1>
              <p className="text-sm text-muted-foreground">AASTU Clinical Management System</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col sticky top-[73px] h-[calc(100vh-73px)]">
          <div className="p-6 border-b border-sidebar-border">
            <h2 className="text-lg font-bold text-sidebar-foreground">Your Modules</h2>
            <p className="text-sm text-sidebar-foreground/70">Access your role-specific features</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {userModules.map((module, index) => (
              <div key={index}>
                <div
                  onClick={() => {
                    if (module.expandable) {
                      setSelectedModule(module.title);
                      setExpandedSections(prev => ({
                        ...prev,
                        [module.title]: !prev[module.title]
                      }));
                    } else {
                      setSelectedModule(module.title);
                    }
                  }}
                  className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer group ${selectedModule === module.title ? 'bg-sidebar-accent ring-1 ring-white/20' : ''
                    }`}
                >
                  <div className="p-2 bg-black rounded-md">
                    <module.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sidebar-foreground group-hover:text-sidebar-accent-foreground text-sm">
                        {module.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        {module.badge && (
                          <Badge variant="secondary" className="text-xs">{module.badge}</Badge>
                        )}
                        {module.expandable && (
                          <div className="text-sidebar-foreground">
                            {expandedSections[module.title] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground/70 truncate">
                      {module.description}
                    </p>
                  </div>
                </div>

                {/* Sub-items for expandable sections */}
                {module.expandable && expandedSections[module.title] && module.subItems && (
                  <div className="ml-8 mt-2 space-y-1">
                    {module.subItems.map((subItem, subIndex) => (
                      <div
                        key={subIndex}
                        onClick={() => setSelectedModule(subItem.title)}
                        className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer group ${selectedModule === subItem.title ? 'bg-sidebar-accent ring-1 ring-white/10' : ''
                          }`}
                      >
                        <div className="p-1 bg-gray-600 rounded-sm">
                          <subItem.icon className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sidebar-foreground group-hover:text-sidebar-accent-foreground text-xs">
                            {subItem.title}
                          </p>
                          <p className="text-xs text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground/60 truncate">
                            {subItem.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Profile Section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.firstName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sidebar-foreground text-sm truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-sidebar-foreground/70 truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <Badge className={`${roleColors[user.role]} border-0 text-xs`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full text-black border-black hover:bg-transparent hover:text-red-500 hover:border-red-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto min-h-[calc(100vh-73px)]">
          <div className="p-6">
            {selectedModule ? (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedModule(null)}
                  className="mb-4"
                >
                  ← Back to Dashboard
                </Button>
                <ModuleContent
                  moduleTitle={selectedModule}
                  moduleKey={selectedModule}
                  role={user.role}
                  setSelectedModule={setSelectedModule}
                />
              </div>
            ) : (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                          <p className="text-2xl font-bold">{stats.totalPatients}</p>
                        </div>
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Today's Visits</p>
                          <p className="text-2xl font-bold">{stats.dailyVisits}</p>
                        </div>
                        <Activity className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Pending Appointments</p>
                          <p className="text-2xl font-bold">{stats.pendingAppointments}</p>
                        </div>
                        <Clock className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Active Treatments</p>
                          <p className="text-2xl font-bold">{stats.activeTreatments}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Welcome Content */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Welcome back, {user.firstName}!</h2>
                    <p className="text-muted-foreground">
                      {user.role === 'doctor' && "Review patient consultations and manage medical records from your modules."}
                      {user.role === 'reception' && "Manage student registrations and patient activation from your modules."}
                      {user.role === 'lab_technician' && "Process test requests and submit lab results from your modules."}
                      {user.role === 'pharmacy' && "Manage prescriptions and medicine inventory from your modules."}
                      {user.role === 'nurse' && "Handle injections and patient care from your modules."}
                      {user.role === 'patient' && "Book appointments and view your medical history from your modules."}
                      {user.role === 'admin' && "Manage system users and view reports from your modules."}
                    </p>
                  </div>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Latest updates in the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">System is running smoothly</p>
                            <p className="text-xs text-muted-foreground">All services operational - 5 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">New user logged in</p>
                            <p className="text-xs text-muted-foreground">{user.firstName} {user.lastName} - 15 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">System updated</p>
                            <p className="text-xs text-muted-foreground">Latest security patches applied - 30 minutes ago</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>

          <footer className="bg-blue-50 border-t py-4">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
                <div className="mb-2 md:mb-0">
                  &copy; {new Date().getFullYear()} AASTU Clinical Management System (ACMS)
                </div>
                <div className="flex items-center space-x-4">
                  <span>Version 1.0.0</span>
                  <span>•</span>
                  <span>All rights reserved</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}