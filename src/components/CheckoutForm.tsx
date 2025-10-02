import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { VRPADevice, TeamMember, Checkout } from '@/types/vrpa';
import { toast } from 'sonner';

interface CheckoutFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: VRPADevice;
  teamMembers: TeamMember[];
  onCheckout: (deviceId: string, checkout: Omit<Checkout, 'id' | 'deviceId' | 'isActive'>) => void;
}

export function CheckoutForm({ open, onOpenChange, device, teamMembers, onCheckout }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    teamMemberId: '',
    clientName: '',
    checkoutDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
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

    if (!formData.expectedReturnDate) {
      newErrors.expectedReturnDate = 'Expected return date is required';
    } else {
      const returnDate = new Date(formData.expectedReturnDate);
      const checkoutDate = new Date(formData.checkoutDate);
      if (returnDate <= checkoutDate) {
        newErrors.expectedReturnDate = 'Return date must be after checkout date';
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

    const checkoutData = {
      teamMemberId: formData.teamMemberId,
      teamMemberName: selectedTeamMember.name,
      clientName: formData.clientName.trim(),
      checkoutDate: new Date(formData.checkoutDate),
      expectedReturnDate: new Date(formData.expectedReturnDate),
      notes: formData.notes.trim()
    };

    onCheckout(device.id, checkoutData);
    toast.success(`Device checked out to ${selectedTeamMember.name}`);
    
    setFormData({
      teamMemberId: '',
      clientName: '',
      checkoutDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: '',
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Check Out Device: {device.name}
          </DialogTitle>
        </DialogHeader>
        
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
              <Label htmlFor="checkoutDate">Checkout Date</Label>
              <Input
                id="checkoutDate"
                type="date"
                value={formData.checkoutDate}
                onChange={(e) => setFormData(prev => ({ ...prev, checkoutDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedReturnDate">Expected Return Date</Label>
              <Input
                id="expectedReturnDate"
                type="date"
                value={formData.expectedReturnDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedReturnDate: e.target.value }))}
              />
              {errors.expectedReturnDate && <p className="text-sm text-destructive">{errors.expectedReturnDate}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes about this checkout..."
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
              Check Out Device
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}