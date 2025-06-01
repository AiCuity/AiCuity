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
import { Pencil, Plus, Minus, Shield, ShieldCheck, Loader2 } from 'lucide-react';
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
      // Run all updates in parallel
      await Promise.all([
        // Update subscription
        new Promise<void>((resolve, reject) => {
          updateUserSubscription(editingUser.id, {
            tier: newTier as any,
            books_limit: newBooksLimit,
            status: 'active'
          });
          // Since we're using mutations, they handle success/error internally
          // For this use case, we'll assume success and let error handling be done by mutations
          resolve();
        }),
        
        // Update role
        new Promise<void>((resolve, reject) => {
          updateUserRole(editingUser.id, newRole as any);
          resolve();
        }),
        
        // Update usage
        new Promise<void>((resolve, reject) => {
          adjustUserUsage(editingUser.id, usageAdjustment);
          resolve();
        })
      ]);

      // Close modal after successful updates
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
      <div className="rounded-md border">
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
                <TableCell className="font-medium">{user.email}</TableCell>
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
                    <DialogContent className="sm:max-w-[425px]">
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
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsEditModalOpen(false);
                            setEditingUser(null);
                          }}
                          disabled={isUpdatingSubscription || isUpdatingRole || isAdjustingUsage}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSaveChanges}
                          disabled={isUpdatingSubscription || isUpdatingRole || isAdjustingUsage}
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
    </div>
  );
} 