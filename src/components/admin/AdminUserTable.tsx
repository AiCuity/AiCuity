import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Pencil, 
  Plus, 
  Minus, 
  Shield, 
  ShieldCheck, 
  Loader2, 
  Calendar, 
  CreditCard, 
  User,
  Activity,
  BarChart3
} from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { AdminUserOverview } from '@/lib/api';

interface AdminUserTableProps {
  users: AdminUserOverview[];
  isLoading: boolean;
}

export default function AdminUserTable({ users, isLoading }: AdminUserTableProps) {
  const { 
    updateUserSubscription, 
    updateUserRole, 
    adjustUserUsage,
    isUpdatingSubscription,
    isUpdatingRole,
    isAdjustingUsage
  } = useAdmin();
  
  const [editingUser, setEditingUser] = useState<AdminUserOverview | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTier, setNewTier] = useState<string>('');
  const [newBooksLimit, setNewBooksLimit] = useState<number>(0);
  const [newRole, setNewRole] = useState<string>('');
  const [usageAdjustment, setUsageAdjustment] = useState<number>(0);

  const handleEditUser = (user: AdminUserOverview) => {
    setEditingUser(user);
    setNewTier(user.tier || 'free');
    setNewBooksLimit(user.books_limit || 5);
    setNewRole(user.role);
    setUsageAdjustment(user.current_month_usage || 0);
    setIsEditModalOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!editingUser) return;

    try {
      // Update subscription
      updateUserSubscription(editingUser.id, {
        tier: newTier as any,
        books_limit: newBooksLimit,
        status: 'active'
      });

      // Update role
      updateUserRole(editingUser.id, newRole as any);

      // Update usage
      adjustUserUsage(editingUser.id, usageAdjustment);

      // Close modal immediately since mutations handle their own success/error states
      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      // Errors are handled by individual mutations
      console.error('Error in bulk update:', error);
    }
  };

  const handleUsageIncrement = (userId: string, currentUsage: number) => {
    adjustUserUsage(userId, currentUsage + 1);
  };

  const handleUsageDecrement = (userId: string, currentUsage: number) => {
    adjustUserUsage(userId, Math.max(0, currentUsage - 1));
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getTierBadgeVariant = (tier: string | null) => {
    switch (tier) {
      case 'premium':
      case 'enterprise':
        return 'default';
      case 'professional':
      case 'advanced':
        return 'secondary';
      case 'starter':
      case 'basic':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'canceled':
      case 'inactive':
        return 'destructive';
      case 'trialing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden lg:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Books Limit</TableHead>
              <TableHead>Usage (This Month)</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium max-w-[220px] truncate">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role === 'super_admin' && <ShieldCheck className="mr-1 h-3 w-3" />}
                    {user.role === 'admin' && <Shield className="mr-1 h-3 w-3" />}
                    {user.role.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getTierBadgeVariant(user.tier)}>
                    {user.tier || 'free'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(user.subscription_status)}>
                    {user.subscription_status || 'inactive'}
                  </Badge>
                </TableCell>
                <TableCell>{user.books_limit || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUsageDecrement(user.id, user.current_month_usage || 0)}
                      disabled={isAdjustingUsage}
                    >
                      {isAdjustingUsage ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                    </Button>
                    <span className="min-w-[2rem] text-center">
                      {user.current_month_usage || 0}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUsageIncrement(user.id, user.current_month_usage || 0)}
                      disabled={isAdjustingUsage}
                    >
                      {isAdjustingUsage ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(user.profile_created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {user.last_sign_in_at 
                    ? new Date(user.last_sign_in_at).toLocaleDateString()
                    : 'Never'
                  }
                </TableCell>
                <TableCell>
                  <Dialog open={isEditModalOpen && editingUser?.id === user.id} onOpenChange={(open) => {
                    if (!open) {
                      setIsEditModalOpen(false);
                      setEditingUser(null);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUser(user)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                      <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                          Update user subscription, role, and usage for {user.email}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="role" className="text-right">
                            Role
                          </label>
                          <Select value={newRole} onValueChange={setNewRole}>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="tier" className="text-right">
                            Tier
                          </label>
                          <Select value={newTier} onValueChange={setNewTier}>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select tier" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="starter">Starter</SelectItem>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                              <SelectItem value="unlimited">Unlimited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="books_limit" className="text-right">
                            Books Limit
                          </label>
                          <Input
                            id="books_limit"
                            type="number"
                            value={newBooksLimit}
                            onChange={(e) => setNewBooksLimit(parseInt(e.target.value) || 0)}
                            className="col-span-3"
                          />
                        </div>
                        
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="usage" className="text-right">
                            Usage Count
                          </label>
                          <Input
                            id="usage"
                            type="number"
                            value={usageAdjustment}
                            onChange={(e) => setUsageAdjustment(parseInt(e.target.value) || 0)}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsEditModalOpen(false);
                            setEditingUser(null);
                          }}
                          disabled={isUpdatingSubscription || isUpdatingRole || isAdjustingUsage}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSaveChanges}
                          disabled={isUpdatingSubscription || isUpdatingRole || isAdjustingUsage}
                          className="w-full sm:w-auto"
                        >
                          {(isUpdatingSubscription || isUpdatingRole || isAdjustingUsage) ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {users.map((user) => (
          <Card key={user.id} className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                      <User className="h-4 w-4 text-white flex-shrink-0" />
                    </div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 break-all">{user.email}</p>
                  </div>
                  <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs font-medium">
                    {user.role === 'super_admin' && <ShieldCheck className="mr-1 h-3 w-3 flex-shrink-0" />}
                    {user.role === 'admin' && <Shield className="mr-1 h-3 w-3 flex-shrink-0" />}
                    {user.role.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4 space-y-4">
              {/* Subscription & Status Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Subscription</span>
                  </div>
                  <Badge variant={getTierBadgeVariant(user.tier)} className="text-xs font-medium">
                    {user.tier || 'free'}
                  </Badge>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</span>
                  </div>
                  <Badge variant={getStatusBadgeVariant(user.subscription_status)} className="text-xs font-medium">
                    {user.subscription_status || 'inactive'}
                  </Badge>
                </div>
              </div>

              {/* Usage & Limits Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Books Limit</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{user.books_limit || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-purple-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">This Month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUsageDecrement(user.id, user.current_month_usage || 0)}
                      disabled={isAdjustingUsage}
                      className="h-7 w-7 p-0 rounded-full"
                    >
                      {isAdjustingUsage ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                    </Button>
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100 min-w-[2rem] text-center">
                      {user.current_month_usage || 0}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUsageIncrement(user.id, user.current_month_usage || 0)}
                      disabled={isAdjustingUsage}
                      className="h-7 w-7 p-0 rounded-full"
                    >
                      {isAdjustingUsage ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {new Date(user.profile_created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Last Sign In</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.last_sign_in_at 
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <Dialog open={isEditModalOpen && editingUser?.id === user.id} onOpenChange={(open) => {
                if (!open) {
                  setIsEditModalOpen(false);
                  setEditingUser(null);
                }
              }}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => handleEditUser(user)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-sm"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit User Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                  <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription className="break-words">
                      Update user subscription, role, and usage for {user.email}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="role" className="text-sm font-medium">
                        Role
                      </label>
                      <Select value={newRole} onValueChange={setNewRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="tier" className="text-sm font-medium">
                        Tier
                      </label>
                      <Select value={newTier} onValueChange={setNewTier}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="starter">Starter</SelectItem>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="books_limit" className="text-sm font-medium">
                        Books Limit
                      </label>
                      <Input
                        id="books_limit"
                        type="number"
                        value={newBooksLimit}
                        onChange={(e) => setNewBooksLimit(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="usage" className="text-sm font-medium">
                        Usage Count
                      </label>
                      <Input
                        id="usage"
                        type="number"
                        value={usageAdjustment}
                        onChange={(e) => setUsageAdjustment(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={handleSaveChanges}
                      disabled={isUpdatingSubscription || isUpdatingRole || isAdjustingUsage}
                      className="w-full"
                    >
                      {(isUpdatingSubscription || isUpdatingRole || isAdjustingUsage) ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditModalOpen(false);
                        setEditingUser(null);
                      }}
                      disabled={isUpdatingSubscription || isUpdatingRole || isAdjustingUsage}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 