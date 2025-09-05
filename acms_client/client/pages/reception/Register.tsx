import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Student } from '@shared/types';
import { Stethoscope, ArrowLeft, Search, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

export default function Register() {
  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [studentFound, setStudentFound] = useState<Student | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  // New registration form state
  const [formData, setFormData] = useState({
    universityId: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    year: '1',
    emergencyContact: '',
    bloodType: '',
    allergies: ''
  });

  const handleSearch = async () => {
    if (!searchId.trim()) return;

    setIsSearching(true);

    // Simulate API call to check if student exists
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo - simulate different scenarios
    if (searchId === 'ETS0117/14') {
      setStudentFound({
        id: '1',
        universityId: searchId,
        name: 'Alemayehu Tadesse',
        email: 'alemayehu.tadesse@aastu.edu.et',
        phone: '+251911234567',
        department: 'Computer Science',
        year: 3,
        emergencyContact: '+251912345678',
        bloodType: 'A+',
        allergies: ['Penicillin'],
        isActive: false,
        isFirstVisit: false,
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2024-01-15')
      });
    } else {
      setStudentFound(null);
      setShowRegistrationForm(true);
      setFormData({ ...formData, universityId: searchId });
    }

    setIsSearching(false);
  };

  const handleActivateStudent = async () => {
    if (!studentFound) return;

    setIsSearching(true);

    // Simulate activation API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update student status and forward to doctor
    setStudentFound({ ...studentFound, isActive: true });

    // Show success and redirect
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);

    setIsSearching(false);
  };

  const handleRegisterNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);

    // Simulate registration API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create new student record
    const newStudent: Student = {
      id: Date.now().toString(),
      universityId: formData.universityId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      year: parseInt(formData.year),
      emergencyContact: formData.emergencyContact,
      bloodType: formData.bloodType || undefined,
      allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
      isActive: true,
      isFirstVisit: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Generate patient portal access code
    const portalAccessCode = 'VISIT' + Math.random().toString(36).substr(2, 6).toUpperCase();

    setStudentFound({ ...newStudent, portalAccessCode } as any);
    setShowRegistrationForm(false);
    setIsRegistering(false);

    // Show success message and redirect
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary rounded-lg">
                <Stethoscope className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Student Registration</h1>
                <p className="text-sm text-muted-foreground">Verify ID & Register New Students</p>
              </div>
            </div>
          </div>
          <Badge className="bg-blue-100 text-blue-800 border-0">Receptionist</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Student ID Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>University ID Verification</span>
            </CardTitle>
            <CardDescription>
              Enter the student's university ID to check if they're already registered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter University ID (e.g., AASTU001)"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching || !searchId.trim()}>
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Student Found - Activation */}
        {studentFound && !studentFound.isActive && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span>Student Found - Ready for Activation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm">{studentFound.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">University ID</Label>
                    <p className="text-sm">{studentFound.universityId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Department</Label>
                    <p className="text-sm">{studentFound.department}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Year</Label>
                    <p className="text-sm">Year {studentFound.year}</p>
                  </div>
                </div>

                <Button onClick={handleActivateStudent} className="w-full" disabled={isSearching}>
                  {isSearching ? 'Activating...' : 'Activate Student & Send to Doctor'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Student Already Active */}
        {studentFound && studentFound.isActive && !(studentFound as any).portalAccessCode && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <CheckCircle className="h-5 w-5" />
                <span>Student Already Active</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-4">
                {studentFound.name} ({studentFound.universityId}) is already activated and ready for consultation.
              </p>
              <Link to="/reception/send-doctor">
                <Button className="w-full">Send to Doctor</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* New Student Registration Success with Portal Access */}
        {studentFound && studentFound.isActive && (studentFound as any).portalAccessCode && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span>Student Registered Successfully!</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm">{studentFound.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">University ID</Label>
                  <p className="text-sm">{studentFound.universityId}</p>
                </div>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-blue-800">Patient Portal Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs font-medium text-blue-700">Portal Access Code:</Label>
                      <p className="text-sm font-mono bg-white p-2 rounded border">{(studentFound as any).portalAccessCode}</p>
                    </div>
                    <p className="text-xs text-blue-700">
                      Give this code to the student for online portal access after their visit.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full">Send to Doctor</Button>
            </CardContent>
          </Card>
        )}

        {/* Registration Form for New Students */}
        {showRegistrationForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Register New Student</span>
              </CardTitle>
              <CardDescription>
                Student not found. Please register them as a new patient.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegisterNew} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="universityId">University ID *</Label>
                    <Input
                      id="universityId"
                      value={formData.universityId}
                      onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                      required
                      readOnly
                    />
                  </div>

                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                        <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                        <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                        <SelectItem value="Chemical Engineering">Chemical Engineering</SelectItem>
                        <SelectItem value="Applied Biology">Applied Biology</SelectItem>
                        <SelectItem value="Applied Chemistry">Applied Chemistry</SelectItem>
                        <SelectItem value="Applied Physics">Applied Physics</SelectItem>
                        <SelectItem value="Applied Mathematics">Applied Mathematics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="year">Year of Study *</Label>
                    <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Year 1</SelectItem>
                        <SelectItem value="2">Year 2</SelectItem>
                        <SelectItem value="3">Year 3</SelectItem>
                        <SelectItem value="4">Year 4</SelectItem>
                        <SelectItem value="5">Year 5</SelectItem>
                        <SelectItem value="6">Year 6</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact *</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="bloodType">Blood Type (Optional)</Label>
                    <Select value={formData.bloodType} onValueChange={(value) => setFormData({ ...formData, bloodType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="allergies">Known Allergies (Optional)</Label>
                  <Textarea
                    id="allergies"
                    placeholder="Enter known allergies separated by commas"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  />
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" className="flex-1" disabled={isRegistering}>
                    {isRegistering ? 'Registering...' : 'Register & Activate Student'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowRegistrationForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
