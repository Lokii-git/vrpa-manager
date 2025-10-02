import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TeamMember } from '@/types/vrpa';
import { Users, PencilSimple, Trash, Plus, FloppyDisk, File } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface AdminPanelProps {
  teamMembers: TeamMember[];
  onAddUser: (user: Omit<TeamMember, 'id'>) => void;
  onUpdateUser: (id: string, user: Omit<TeamMember, 'id'>) => void;
  onRemoveUser: (id: string) => void;
}

export function AdminPanel({ teamMembers, onAddUser, onUpdateUser, onRemoveUser }: AdminPanelProps) {
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [emailEditorOpen, setEmailEditorOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null);
  const [userToDelete, setUserToDelete] = useState<TeamMember | null>(null);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    // Load the email template when the editor opens
    if (emailEditorOpen) {
      fetch('/vRPAemail.md')
        .then(res => res.text())
        .then(text => setEmailTemplate(text))
        .catch(() => {
          toast.error('Failed to load email template');
        });
    }
  }, [emailEditorOpen]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({ name: '', email: '' });
    setUserFormOpen(true);
  };

  const handleEditUser = (user: TeamMember) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email });
    setUserFormOpen(true);
  };

  const handleDeleteClick = (user: TeamMember) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      onRemoveUser(userToDelete.id);
      toast.success(`Removed ${userToDelete.name}`);
      setUserToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (selectedUser) {
      onUpdateUser(selectedUser.id, formData);
      toast.success(`Updated ${formData.name}`);
    } else {
      onAddUser(formData);
      toast.success(`Added ${formData.name}`);
    }

    setUserFormOpen(false);
    setFormData({ name: '', email: '' });
  };

  const handleSaveEmailTemplate = async () => {
    try {
      // In a real application, you would save this to a backend or KV store
      // For now, we'll use localStorage as a fallback
      localStorage.setItem('vRPAemail-template', emailTemplate);
      
      // Also create a blob and download it so user can save it
      const blob = new Blob([emailTemplate], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vRPAemail.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Email template saved and downloaded');
      setEmailEditorOpen(false);
    } catch (error) {
      toast.error('Failed to save email template');
    }
  };

  return (
    <div className="space-y-6">
      {/* User Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Manage team members who can check out and schedule devices
              </CardDescription>
            </div>
            <Button onClick={handleAddUser}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.length > 0 ? (
                  teamMembers.map(member => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(member)}
                          >
                            <PencilSimple className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(member)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No team members yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Email Template Editor Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <File className="h-5 w-5" />
                Email Template
              </CardTitle>
              <CardDescription>
                Edit the vRPA email template (vRPAemail.md)
              </CardDescription>
            </div>
            <Button onClick={() => setEmailEditorOpen(true)} variant="outline">
              <PencilSimple className="h-4 w-4 mr-2" />
              Edit Template
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* User Form Dialog */}
      <Dialog open={userFormOpen} onOpenChange={setUserFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Edit User' : 'Add User'}</DialogTitle>
            <DialogDescription>
              {selectedUser ? 'Update team member information' : 'Add a new team member'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.doe@company.com"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setUserFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedUser ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Email Template Editor Dialog */}
      <Dialog open={emailEditorOpen} onOpenChange={setEmailEditorOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
            <DialogDescription>
              Edit the markdown template. The [Insert Link Here] placeholder will be replaced with the sharefile link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template">Template Content (Markdown)</Label>
              <Textarea
                id="template"
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                className="font-mono min-h-[400px]"
                placeholder="Enter your email template here..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEmailEditorOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEmailTemplate}>
                <FloppyDisk className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {userToDelete?.name} from the team members list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
