import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Construction, Stethoscope } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  module: string;
  role: string;
}

export default function PlaceholderPage({ title, description, module, role }: PlaceholderPageProps) {
  const roleColors: Record<string, string> = {
    receptionist: 'bg-blue-100 text-blue-800',
    doctor: 'bg-green-100 text-green-800',
    lab: 'bg-purple-100 text-purple-800',
    pharmacy: 'bg-orange-100 text-orange-800',
    nurse: 'bg-pink-100 text-pink-800',
    patient: 'bg-gray-100 text-gray-800',
    admin: 'bg-red-100 text-red-800'
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
                <h1 className="text-xl font-bold text-primary">{title}</h1>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          </div>
          <Badge className={`${roleColors[role]} border-0`}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardHeader className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-muted rounded-full">
                  <Construction className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl">Module Under Development</CardTitle>
              <CardDescription className="text-base">
                The <strong>{module}</strong> module is currently being developed and will be available soon.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Coming Soon:</strong> This module will include all the features described in the system requirements.
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  In the meantime, you can:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Return to the dashboard to access other modules</li>
                  <li>• Contact the system administrator for updates</li>
                  <li>• Check back later for new features</li>
                </ul>
              </div>
              
              <Link to="/dashboard">
                <Button className="w-full">Return to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
