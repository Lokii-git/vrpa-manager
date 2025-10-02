import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { UserForm } from '@/components/UserForm';
import { TeamMember } from '@/types/vrpa';
import { Plus, Trash, PencilSimple, User } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface AdminPanelProps {
  teamMembers: TeamMember[];
  onAddUser: (userData: Omit<TeamMember, 'id'>) => void;
  onUpdateUser: (userId: string, userData: Partial<TeamMember>) => void;
  onRemoveUser: (userId: string) => void;
}

export function AdminPanel({ teamMembers, onAddUser, onUpdateUser, onRemoveUser }: AdminPanelProps) {
  const handleRemoveUser = (user: TeamMember) => {
    onRemoveUser(user.id);
    toast.success(`User ${user.name} removed successfully`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Panel</h2>
          <p className="text-muted-foreground">Manage team members and user access</p>
        </div>
        <UserForm
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          }
          onSave={onAddUser}
        />
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <CardDescription>Active team members in the system</CardDescription>
          </div>
          <User className="h-8 w-8 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{teamMembers.length}</div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>View and manage all team members</CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        {member.name}
                      </div>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <UserForm
                          trigger={
                            <Button variant="ghost" size="sm">
                              <PencilSimple className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          }
                          user={member}
                          onSave={onAddUser}
                          onUpdate={onUpdateUser}
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove <strong>{member.name}</strong>? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveUser(member)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No users yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first team member to get started.
              </p>
              <UserForm
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First User
                  </Button>
                }
                onSave={onAddUser}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
