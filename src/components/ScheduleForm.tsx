import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { VRPADevice, TeamMember, ScheduledDeployment } from '@/types/vrpa';
import { canScheduleDevice } from '@/lib/vrpa-utils';
import { toast } from 'sonner';

interface ScheduleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: VRPADevice;
  teamMembers: TeamMember[];
  onSchedule: (deviceId: string, schedule: Omit<ScheduledDeployment, 'id' | 'deviceId' | 'isActive'>) => void;
}

export function ScheduleForm({ open, onOpenChange, device, teamMembers, onSchedule }: ScheduleFormProps) {
  const [formData, setFormData] = useState({
    teamMemberId: '',
    clientName: '',
    scheduledDate: '',
    expectedEndDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.teamMemberId) {
      newErrors.teamMemberId = 'Team member is required';
    }

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required';
    } else {
      const scheduledDate = new Date(formData.scheduledDate);
      const now = new Date();
      if (scheduledDate <= now) {
        newErrors.scheduledDate = 'Scheduled date must be in the future';
      } else if (!canScheduleDevice(device, scheduledDate)) {
        newErrors.scheduledDate = 'Device is not available on this date';
      }
    }

    if (!formData.expectedEndDate) {
      newErrors.expectedEndDate = 'Expected end date is required';
    } else {
      const endDate = new Date(formData.expectedEndDate);
      const startDate = new Date(formData.scheduledDate);
      if (endDate <= startDate) {
        newErrors.expectedEndDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    const selectedTeamMember = teamMembers.find(tm => tm.id === formData.teamMemberId);
    if (!selectedTeamMember) {
      toast.error('Selected team member not found');
      return;
    }

    const scheduleData = {
      teamMemberId: formData.teamMemberId,
      teamMemberName: selectedTeamMember.name,
      clientName: formData.clientName.trim(),
      scheduledDate: new Date(formData.scheduledDate),
      expectedEndDate: new Date(formData.expectedEndDate),
      notes: formData.notes.trim()
    };

    onSchedule(device.id, scheduleData);
    toast.success(`Device scheduled for ${selectedTeamMember.name}`);
    
    setFormData({
      teamMemberId: '',
      clientName: '',
      scheduledDate: '',
      expectedEndDate: '',
      notes: ''
    });
    setErrors({});
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setErrors({});
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getEarliestAvailableDate = () => {
    if (device.currentCheckout?.isActive) {
      const returnDate = new Date(device.currentCheckout.expectedReturnDate);
      returnDate.setDate(returnDate.getDate() + 1);
      return returnDate.toISOString().split('T')[0];
    }
    return getMinDate();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Schedule Device: {device.name}
          </DialogTitle>
        </DialogHeader>

        {device.currentCheckout?.isActive && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm">
            <p className="text-yellow-400">
              Device is currently checked out to {device.currentCheckout.teamMemberName} until{' '}
              {new Date(device.currentCheckout.expectedReturnDate).toLocaleDateString()}. 
              Schedule will be available after this date.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamMember">Team Member</Label>
            <Select 
              value={formData.teamMemberId} 
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, teamMemberId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.teamMemberId && <p className="text-sm text-destructive">{errors.teamMemberId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              placeholder="e.g., Acme Corporation"
            />
            {errors.clientName && <p className="text-sm text-destructive">{errors.clientName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Start Date</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                min={getEarliestAvailableDate()}
              />
              {errors.scheduledDate && <p className="text-sm text-destructive">{errors.scheduledDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedEndDate">End Date</Label>
              <Input
                id="expectedEndDate"
                type="date"
                value={formData.expectedEndDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedEndDate: e.target.value }))}
                min={formData.scheduledDate || getEarliestAvailableDate()}
              />
              {errors.expectedEndDate && <p className="text-sm text-destructive">{errors.expectedEndDate}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes about this scheduled deployment..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Schedule Device
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}