import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VRPADevice } from '@/types/vrpa';
import { getStatusColor, getCheckoutStatusText, isDeviceAvailable } from '@/lib/vrpa-utils';
import { Monitor, User, Calendar, Eye, EyeSlash, Link, Gear } from '@phosphor-icons/react';
import { useState } from 'react';

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
            <div className="flex items-center gap-2">
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
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Sharefile:</span>
            <div className="flex items-center gap-2">
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
              >
                {showSharefile ? <EyeSlash className="h-4 w-4" /> : <Link className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <User className="h-4 w-4" />
            <span>{statusText}</span>
          </div>

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
        </div>
      </CardContent>
    </Card>
  );
}