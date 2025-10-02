import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VRPADevice } from '@/types/vrpa';
import { getStatusColor, getCheckoutStatusText, isDeviceAvailable } from '@/lib/vrpa-utils';
import { Monitor, User, Calendar, Eye, EyeSlash, Link, Gear, Copy, Envelope } from '@phosphor-icons/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DeviceCardProps {
  device: VRPADevice;
  onCheckout: (device: VRPADevice) => void;
  onSchedule: (device: VRPADevice) => void;
  onReturn: (device: VRPADevice) => void;
  onEdit: (device: VRPADevice) => void;
  onViewHistory: (device: VRPADevice) => void;
}

export function DeviceCard({ 
  device, 
  onCheckout, 
  onSchedule, 
  onReturn, 
  onEdit, 
  onViewHistory 
}: DeviceCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showSharefile, setShowSharefile] = useState(false);

  const isAvailable = isDeviceAvailable(device);
  const statusText = getCheckoutStatusText(device);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (err) {
      toast.error(`Failed to copy ${label}`);
    }
  };

  const copyEmailTemplate = async () => {
    try {
      const response = await fetch('/vRPAemail.md');
      const template = await response.text();
      const filledTemplate = template.replace('[Insert Link Here]', device.sharefileLink);
      await navigator.clipboard.writeText(filledTemplate);
      toast.success('Email template copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy email template');
    }
  };

  return (
    <Card className="device-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Monitor className={`h-5 w-5 ${getStatusColor(device.status)}`} />
            <CardTitle className="text-lg">{device.name}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {device.type === 'Custom' && device.customType ? device.customType : device.type}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`status-badge ${device.status}`}>
            {device.status}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(device)}
          >
            <Gear className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">IP Address:</span>
            <code className="font-mono bg-muted px-2 py-1 rounded text-xs">
              {device.ipAddress}
            </code>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Root Password:</span>
            <div className="flex items-center gap-1">
              <code className="font-mono bg-muted px-2 py-1 rounded text-xs">
                {showPassword ? device.rootPassword : '••••••••'}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                title="Toggle visibility"
              >
                {showPassword ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(device.rootPassword, 'Root password')}
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Sharefile:</span>
            <div className="flex items-center gap-1">
              {showSharefile ? (
                <a 
                  href={device.sharefileLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-xs break-all"
                >
                  {device.sharefileLink}
                </a>
              ) : (
                <span className="text-xs text-muted-foreground">••••••••</span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSharefile(!showSharefile)}
                title="Toggle visibility"
              >
                {showSharefile ? <EyeSlash className="h-4 w-4" /> : <Link className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(device.sharefileLink, 'Sharefile link')}
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <User className="h-4 w-4" />
            <span>{statusText}</span>
          </div>

          {/* Show next scheduled info if device is checked out but also scheduled */}
          {device.currentCheckout?.isActive && device.nextScheduled?.isActive && (
            <div className="mb-3 p-2 bg-muted rounded-md text-sm">
              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Next Scheduled</span>
              </div>
              <div className="text-xs text-muted-foreground">
                <div><strong>User:</strong> {device.nextScheduled.teamMemberName}</div>
                <div><strong>From:</strong> {new Date(device.nextScheduled.scheduledDate).toLocaleDateString()}</div>
                <div><strong>To:</strong> {new Date(device.nextScheduled.expectedEndDate).toLocaleDateString()}</div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {isAvailable ? (
              <Button 
                onClick={() => onCheckout(device)}
                size="sm"
                className="flex-1"
              >
                Check Out
              </Button>
            ) : (
              <Button 
                onClick={() => onReturn(device)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Return
              </Button>
            )}
            
            <Button 
              onClick={() => onSchedule(device)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Schedule
            </Button>
            
            <Button 
              onClick={() => onViewHistory(device)}
              variant="ghost"
              size="sm"
            >
              History
            </Button>
          </div>

          {/* Copy Email Template Button */}
          <div className="mt-2 pt-2 border-t">
            <Button
              onClick={copyEmailTemplate}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Envelope className="h-4 w-4 mr-2" />
              Copy Email Template
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}