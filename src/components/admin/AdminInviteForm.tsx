import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Mail, Loader2 } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';

export default function AdminInviteForm() {
  const { inviteAdmin, isInviting } = useAdmin();
  const [email, setEmail] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    inviteAdmin(email.trim());
    // Clear the email input after initiating the invitation
    setEmail('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Invite Admin
        </CardTitle>
        <CardDescription>
          Send an invitation to make someone an admin. Only super admins can invite new admins.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInvite} className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
              disabled={isInviting}
            />
          </div>
          <Button type="submit" disabled={isInviting || !email.trim()}>
            {isInviting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Invite'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 