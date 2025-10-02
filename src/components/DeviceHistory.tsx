import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VRPADevice, PingHistory } from '@/types/vrpa';
import { generateUptimeHistory, formatUptime } from '@/lib/vrpa-utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DeviceHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: VRPADevice;
  pingHistory: PingHistory[];
}

export function DeviceHistory({ open, onOpenChange, device, pingHistory }: DeviceHistoryProps) {
  const uptimeHistory = generateUptimeHistory(pingHistory);
  
  // Format data for the chart
  const chartData = uptimeHistory.map(record => ({
    date: new Date(record.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    uptime: record.uptimePercentage,
    pings: record.totalPings
  }));

  const recentHistory = pingHistory
    .filter(ping => ping.deviceId === device.id)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 20);

  const overallUptime = uptimeHistory.length > 0 
    ? uptimeHistory.reduce((sum, record) => sum + record.uptimePercentage, 0) / uptimeHistory.length
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Uptime History: {device.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {formatUptime(overallUptime)}
              </div>
              <div className="text-sm text-muted-foreground">
                30-Day Uptime
              </div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {pingHistory.filter(p => p.deviceId === device.id).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Pings
              </div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className={`text-2xl font-bold ${
                device.status === 'online' ? 'text-green-400' : 
                device.status === 'offline' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {device.status.toUpperCase()}
              </div>
              <div className="text-sm text-muted-foreground">
                Current Status
              </div>
            </div>
          </div>

          {/* Uptime Chart */}
          {chartData.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Daily Uptime Percentage</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255,255,255,0.7)"
                      fontSize={12}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      stroke="rgba(255,255,255,0.7)"
                      fontSize={12}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)}%`, 
                        'Uptime'
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="uptime" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, fill: '#60a5fa' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Ping History */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Recent Ping History</h3>
            {recentHistory.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentHistory.map((ping, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        ping.status === 'online' ? 'bg-green-400' : 
                        ping.status === 'offline' ? 'bg-red-400' : 'bg-yellow-400'
                      }`} />
                      <span className="font-mono">
                        {ping.timestamp.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`capitalize ${
                        ping.status === 'online' ? 'text-green-400' : 
                        ping.status === 'offline' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {ping.status}
                      </span>
                      {ping.responseTime && (
                        <span className="text-muted-foreground font-mono">
                          {ping.responseTime.toFixed(1)}ms
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No ping history available
              </div>
            )}
          </div>

          {/* Checkout History */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Checkout Information</h3>
            {device.currentCheckout?.isActive ? (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Checked out to:</span>
                    <div className="font-medium">{device.currentCheckout.teamMemberName}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Client:</span>
                    <div className="font-medium">{device.currentCheckout.clientName}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Checkout date:</span>
                    <div className="font-medium">
                      {new Date(device.currentCheckout.checkoutDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expected return:</span>
                    <div className="font-medium">
                      {new Date(device.currentCheckout.expectedReturnDate).toLocaleDateString()}
                    </div>
                  </div>
                  {device.currentCheckout.notes && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Notes:</span>
                      <div className="font-medium">{device.currentCheckout.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            ) : device.nextScheduled?.isActive ? (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Scheduled for:</span>
                    <div className="font-medium">{device.nextScheduled.teamMemberName}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Client:</span>
                    <div className="font-medium">{device.nextScheduled.clientName}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Start date:</span>
                    <div className="font-medium">
                      {new Date(device.nextScheduled.scheduledDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">End date:</span>
                    <div className="font-medium">
                      {new Date(device.nextScheduled.expectedEndDate).toLocaleDateString()}
                    </div>
                  </div>
                  {device.nextScheduled.notes && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Notes:</span>
                      <div className="font-medium">{device.nextScheduled.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
                Device is currently available
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}