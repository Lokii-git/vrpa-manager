import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useVRPADevices } from '@/hooks/use-vrpa';
import { DeviceCard } from '@/components/DeviceCard';
import { DeviceForm } from '@/components/DeviceForm';
import { CheckoutForm } from '@/components/CheckoutForm';
import { ScheduleForm } from '@/components/ScheduleForm';
import { DeviceHistory } from '@/components/DeviceHistory';
import { VRPADevice } from '@/types/vrpa';
import { Plus, Monitor, Users, Calendar, Activity } from '@phosphor-icons/react';
import { toast } from 'sonner';

function App() {
  const {
    devices,
    teamMembers,
    pingHistory,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    addDevice,
    updateDevice,
    deleteDevice,
    checkoutDevice,
    returnDevice,
    scheduleDevice,
    getDevicePingHistory
  } = useVRPADevices();

  const [checkoutFormOpen, setCheckoutFormOpen] = useState(false);
  const [scheduleFormOpen, setScheduleFormOpen] = useState(false);
  const [historyFormOpen, setHistoryFormOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<VRPADevice | null>(null);

  // Start monitoring on component mount
  useEffect(() => {
    if (!isMonitoring && devices && devices.length > 0) {
      startMonitoring();
    }
    
    return () => {
      if (isMonitoring) {
        stopMonitoring();
      }
    };
  }, [devices, isMonitoring, startMonitoring, stopMonitoring]);

  const handleCheckout = (device: VRPADevice) => {
    setSelectedDevice(device);
    setCheckoutFormOpen(true);
  };

  const handleSchedule = (device: VRPADevice) => {
    setSelectedDevice(device);
    setScheduleFormOpen(true);
  };

  const handleReturn = (device: VRPADevice) => {
    returnDevice(device.id);
    toast.success(`Device ${device.name} returned successfully`);
  };

  const handleEdit = (device: VRPADevice) => {
    // This will be handled by the DeviceForm component
  };

  const handleViewHistory = (device: VRPADevice) => {
    setSelectedDevice(device);
    setHistoryFormOpen(true);
  };

  const handleDeleteDevice = (device: VRPADevice) => {
    if (device.currentCheckout?.isActive) {
      toast.error('Cannot delete device that is currently checked out');
      return;
    }
    
    if (confirm(`Are you sure you want to delete ${device.name}?`)) {
      deleteDevice(device.id);
      toast.success('Device deleted successfully');
    }
  };

  // Statistics
  const stats = {
    total: devices?.length || 0,
    online: devices?.filter(d => d.status === 'online').length || 0,
    checkedOut: devices?.filter(d => d.currentCheckout?.isActive).length || 0,
    scheduled: devices?.filter(d => d.nextScheduled?.isActive).length || 0
  };

  const availableDevices = devices?.filter(d => !d.currentCheckout?.isActive) || [];
  const checkedOutDevices = devices?.filter(d => d.currentCheckout?.isActive) || [];
  const scheduledDevices = devices?.filter(d => d.nextScheduled?.isActive) || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Monitor className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">vRPA Management</h1>
              </div>
              <Badge variant="outline" className="text-xs">
                {isMonitoring ? 'Monitoring Active' : 'Monitoring Stopped'}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant={isMonitoring ? "destructive" : "default"}
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                size="sm"
              >
                <Activity className="h-4 w-4 mr-2" />
                {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
              </Button>
              
              <DeviceForm
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Device
                  </Button>
                }
                devices={devices || []}
                onSave={addDevice}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online</CardTitle>
              <div className="h-2 w-2 rounded-full bg-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{stats.online}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Checked Out</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{stats.checkedOut}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{stats.scheduled}</div>
            </CardContent>
          </Card>
        </div>

        {/* Device Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Devices ({stats.total})</TabsTrigger>
            <TabsTrigger value="available">Available ({availableDevices.length})</TabsTrigger>
            <TabsTrigger value="checked-out">Checked Out ({checkedOutDevices.length})</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled ({scheduledDevices.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {devices && devices.length > 0 ? (
                devices.map(device => (
                  <div key={device.id} className="relative group">
                    <DeviceCard
                      device={device}
                      onCheckout={handleCheckout}
                      onSchedule={handleSchedule}
                      onReturn={handleReturn}
                      onEdit={handleEdit}
                      onViewHistory={handleViewHistory}
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DeviceForm
                        trigger={
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        }
                        device={device}
                        devices={devices}
                        onSave={addDevice}
                        onUpdate={updateDevice}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No devices yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first vRPA device to get started with monitoring and management.
                  </p>
                  <DeviceForm
                    trigger={
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Device
                      </Button>
                    }
                    devices={devices || []}
                    onSave={addDevice}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="available" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableDevices.length > 0 ? (
                availableDevices.map(device => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    onCheckout={handleCheckout}
                    onSchedule={handleSchedule}
                    onReturn={handleReturn}
                    onEdit={handleEdit}
                    onViewHistory={handleViewHistory}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No available devices
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="checked-out" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {checkedOutDevices.length > 0 ? (
                checkedOutDevices.map(device => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    onCheckout={handleCheckout}
                    onSchedule={handleSchedule}
                    onReturn={handleReturn}
                    onEdit={handleEdit}
                    onViewHistory={handleViewHistory}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No devices currently checked out
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scheduledDevices.length > 0 ? (
                scheduledDevices.map(device => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    onCheckout={handleCheckout}
                    onSchedule={handleSchedule}
                    onReturn={handleReturn}
                    onEdit={handleEdit}
                    onViewHistory={handleViewHistory}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No scheduled deployments
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      {selectedDevice && (
        <>
          <CheckoutForm
            open={checkoutFormOpen}
            onOpenChange={setCheckoutFormOpen}
            device={selectedDevice}
            teamMembers={teamMembers || []}
            onCheckout={checkoutDevice}
          />

          <ScheduleForm
            open={scheduleFormOpen}
            onOpenChange={setScheduleFormOpen}
            device={selectedDevice}
            teamMembers={teamMembers || []}
            onSchedule={scheduleDevice}
          />

          <DeviceHistory
            open={historyFormOpen}
            onOpenChange={setHistoryFormOpen}
            device={selectedDevice}
            pingHistory={getDevicePingHistory(selectedDevice.id)}
          />
        </>
      )}
    </div>
  );
}

export default App;