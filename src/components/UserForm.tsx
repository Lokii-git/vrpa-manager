import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TeamMember } from '@/types/vrpa';
import { toast } from 'sonner';

interface UserFormProps {
  trigger: React.ReactNode;
  user?: TeamMember;
  onSave: (userData: Omit<TeamMember, 'id'>) => void;
  onUpdate?: (userId: string, userData: Partial<TeamMember>) => void;
}

export function UserForm({ trigger, user, onSave, onUpdate }: UserFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (user && onUpdate) {
      onUpdate(user.id, { name: name.trim(), email: email.trim() });
      toast.success('User updated successfully');
    } else {
      onSave({ name: name.trim(), email: email.trim() });
      toast.success('User added successfully');
    }

    setOpen(false);
    // Reset form only if adding new user
    if (!user) {
      setName('');
      setEmail('');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && !user) {
      // Reset form when closing if it's a new user form
      setName('');
      setEmail('');
    } else if (newOpen && user) {
      // Re-populate form when opening for edit
      setName(user.name);
      setEmail(user.email);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {user ? 'Update user information' : 'Add a new team member to the system'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{user ? 'Update' : 'Add'} User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
