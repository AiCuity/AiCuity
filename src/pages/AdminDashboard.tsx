import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  CreditCard, 
  Activity, 
  Shield, 
  BarChart3,
  ArrowLeft,
  RefreshCw,
  Zap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import AdminUserTable from '@/components/admin/AdminUserTable';
import ThemeToggle from '@/components/ui/theme-toggle';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { users, isLoading, isAdmin, isCheckingAdmin, refetchUsers } = useAdmin();

  // Redirect if not admin (but wait for admin check to complete)
  useEffect(() => {
    if (user && !isAdmin && !isCheckingAdmin) {
      console.log('Redirecting: not admin', { isAdmin, isCheckingAdmin });
      navigate('/', { replace: true });
    }
  }, [user, isAdmin, isCheckingAdmin, navigate]);

  // Show loading while checking admin status
  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm sm:text-base">Checking admin permissions...</p>
        </div>
      </div>
    );
  }

  // Show loading if we've determined user isn't admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground text-sm sm:text-base">Access denied. Redirecting...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    totalUsers: users.length,
    activeSubscriptions: users.filter(u => u.subscription_status === 'active').length,
    adminUsers: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
    totalUsage: users.reduce((sum, u) => sum + (u.current_month_usage || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Modern Header Bar */}
      <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Left side - Logo and Title */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="px-2 sm:px-3"
              >
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-600">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg sm:text-xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    <span className="hidden sm:inline">Admin Dashboard</span>
                    <span className="sm:hidden">Admin</span>
                  </h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    System Management
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchUsers()}
                disabled={isLoading}
                className="px-2 sm:px-3"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''} ${isLoading ? 'mr-0' : 'mr-1 sm:mr-2'}`} />
                <span className={`${isLoading ? 'hidden' : 'hidden sm:inline'}`}>Refresh</span>
              </Button>
              {/* <ThemeToggle /> */}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Statistics Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalUsers}</div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                <span className="hidden sm:inline">Registered accounts</span>
                <span className="sm:hidden">Accounts</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">
                <span className="hidden sm:inline">Active Subscriptions</span>
                <span className="sm:hidden">Active Subs</span>
              </CardTitle>
              <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">{stats.activeSubscriptions}</div>
              <p className="text-xs text-green-600 dark:text-green-400">
                <span className="hidden sm:inline">Paying customers</span>
                <span className="sm:hidden">Customers</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300">Admin Users</CardTitle>
              <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.adminUsers}</div>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                <span className="hidden sm:inline">Admin accounts</span>
                <span className="sm:hidden">Admins</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">Total Usage</CardTitle>
              <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalUsage}</div>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                <span className="hidden sm:inline">Books read this month</span>
                <span className="sm:hidden">Books/month</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Invite Form */}
        {/* <div className="mb-8">
          <AdminInviteForm />
        </div> */}

        {/* Users Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <BarChart3 className="h-5 w-5 text-primary" />
              User Management
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              <span className="hidden sm:inline">View and manage all users, their subscriptions, and usage limits</span>
              <span className="sm:hidden">Manage users & subscriptions</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <AdminUserTable users={users} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 