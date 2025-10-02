import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VRPADevice } from '@/types/vrpa';
import { getStatusColor, getCheckoutStatusText, isDeviceAvailable } from '@/lib/vrpa-utils';
import { Monitor, User, Calendar, Eye, EyeSlash, Link, Gear, Copy, Envelope } from '@phosphor-icons/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { emailTemplateAPI } from '@/lib/api';

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
  const [emailTemplate, setEmailTemplate] = useState<string>('');

  const isAvailable = isDeviceAvailable(device);
  const statusText = getCheckoutStatusText(device);

  // Load email template from API
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const data = await emailTemplateAPI.get();
        setEmailTemplate(data.template);
      } catch (err) {
        console.error('Failed to load email template:', err);
        // Fallback to file
        try {
          const res = await fetch('/vRPAemail.md');
          const text = await res.text();
          setEmailTemplate(text);
        } catch (fallbackErr) {
          console.error('Failed to load fallback template:', fallbackErr);
        }
      }
    };
    
    loadTemplate();
  }, []);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (err) {
      toast.error(`Failed to copy ${label}`);
    }
  };

  const copyEmailTemplate = async () => {
    if (!emailTemplate) {
      toast.error('Email template not loaded yet');
      return;
    }
    const populatedTemplate = emailTemplate.replace('[Insert Link Here]', device.sharefileLink);
    try {
      await navigator.clipboard.writeText(populatedTemplate);
      toast.success('Email template copied to clipboard');
    } catch (err) {
      console.error('Clipboard copy error:', err);
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
              >
                {showPassword ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(device.rootPassword, 'Root password')}
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
                  className="text-primary hover:underline text-xs break-all max-w-[180px]"
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
              >
                {showSharefile ? <EyeSlash className="h-4 w-4" /> : <Link className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(device.sharefileLink, 'Sharefile link')}
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

          {/* Show scheduled info when device is checked out but also scheduled */}
          {device.currentCheckout?.isActive && device.nextScheduled?.isActive && (
            <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs">
              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 mb-1">
                <Calendar className="h-3 w-3" />
                <span className="font-semibold">Next Scheduled:</span>
              </div>
              <div className="text-muted-foreground">
                <div><strong>{device.nextScheduled.teamMemberName}</strong> - {device.nextScheduled.clientName}</div>
                <div className="flex gap-2 mt-1">
                  <span>From: {new Date(device.nextScheduled.scheduledDate).toLocaleDateString()}</span>
                  <span>To: {new Date(device.nextScheduled.expectedEndDate).toLocaleDateString()}</span>
                </div>
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

          {/* Email template copy button */}
          <div className="mt-2">
            <Button 
              onClick={copyEmailTemplate}
              variant="secondary"
              size="sm"
              className="w-full"
              disabled={!emailTemplate}
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