import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VRPADevice, VRPAType } from '@/types/vrpa';
import { isValidIP, isIPConflict } from '@/lib/vrpa-utils';
import { toast } from 'sonner';

interface DeviceFormProps {
  trigger: React.ReactNode;
  device?: VRPADevice;
  devices: VRPADevice[];
  onSave: (deviceData: Omit<VRPADevice, 'id' | 'status' | 'checkoutStatus' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate?: (deviceId: string, updates: Partial<VRPADevice>) => void;
}

const vrpaTypes: VRPAType[] = ['Hyper-V', 'VMWare', 'Physical', 'Custom'];

export function DeviceForm({ trigger, device, devices, onSave, onUpdate }: DeviceFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: device?.name || '',
    type: device?.type || 'Hyper-V' as VRPAType,
    customType: device?.customType || '',
    ipAddress: device?.ipAddress || '',
    rootPassword: device?.rootPassword || '',
    sharefileLink: device?.sharefileLink || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Device name is required';
    }

    if (!formData.ipAddress.trim()) {
      newErrors.ipAddress = 'IP address is required';
    } else if (!isValidIP(formData.ipAddress)) {
      newErrors.ipAddress = 'Invalid IP address format';
    } else if (isIPConflict(formData.ipAddress, devices, device?.id)) {
      newErrors.ipAddress = 'IP address already in use';
    }

    if (!formData.rootPassword.trim()) {
      newErrors.rootPassword = 'Root password is required';
    }

    if (!formData.sharefileLink.trim()) {
      newErrors.sharefileLink = 'Sharefile link is required';
    }

    if (formData.type === 'Custom' && !formData.customType.trim()) {
      newErrors.customType = 'Custom type name is required';
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

    const deviceData = {
      name: formData.name.trim(),
      type: formData.type,
      customType: formData.type === 'Custom' ? formData.customType.trim() : undefined,
      ipAddress: formData.ipAddress.trim(),
      rootPassword: formData.rootPassword.trim(),
      sharefileLink: formData.sharefileLink.trim()
    };

    if (device && onUpdate) {
      onUpdate(device.id, deviceData);
      toast.success('Device updated successfully');
    } else {
      onSave(deviceData);
      toast.success('Device added successfully');
    }

    setOpen(false);
    setFormData({
      name: '',
      type: 'Hyper-V',
      customType: '',
      ipAddress: '',
      rootPassword: '',
      sharefileLink: ''
    });
    setErrors({});
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setErrors({});
      if (!device) {
        setFormData({
          name: '',
          type: 'Hyper-V',
          customType: '',
          ipAddress: '',
          rootPassword: '',
          sharefileLink: ''
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {device ? 'Edit Device' : 'Add New Device'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Device Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., KALI-HV-001"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Device Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: VRPAType) => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {vrpaTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'Custom' && (
            <div className="space-y-2">
              <Label htmlFor="customType">Custom Type Name</Label>
              <Input
                id="customType"
                value={formData.customType}
                onChange={(e) => setFormData(prev => ({ ...prev, customType: e.target.value }))}
                placeholder="e.g., Docker Container"
              />
              {errors.customType && <p className="text-sm text-destructive">{errors.customType}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="ipAddress">IP Address</Label>
            <Input
              id="ipAddress"
              value={formData.ipAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, ipAddress: e.target.value }))}
              placeholder="e.g., 192.168.1.100"
              className="font-mono"
            />
            {errors.ipAddress && <p className="text-sm text-destructive">{errors.ipAddress}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rootPassword">Root Password</Label>
            <Input
              id="rootPassword"
              type="password"
              value={formData.rootPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, rootPassword: e.target.value }))}
              placeholder="Enter root password"
            />
            {errors.rootPassword && <p className="text-sm text-destructive">{errors.rootPassword}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sharefileLink">Sharefile Link</Label>
            <Input
              id="sharefileLink"
              value={formData.sharefileLink}
              onChange={(e) => setFormData(prev => ({ ...prev, sharefileLink: e.target.value }))}
              placeholder="https://..."
            />
            {errors.sharefileLink && <p className="text-sm text-destructive">{errors.sharefileLink}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {device ? 'Update Device' : 'Add Device'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}