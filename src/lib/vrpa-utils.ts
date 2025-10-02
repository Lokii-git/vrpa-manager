import { VRPADevice, Checkout, ScheduledDeployment, DeviceStatus, PingHistory, DeviceUptime } from '@/types/vrpa';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function isValidIP(ip: string): boolean {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) return false;
  
  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

export function getStatusColor(status: DeviceStatus): string {
  switch (status) {
    case 'online':
      return 'text-green-400';
    case 'offline':
      return 'text-red-400';
    case 'unknown':
    default:
      return 'text-yellow-400';
  }
}

export function getCheckoutStatusText(device: VRPADevice): string {
  if (device.currentCheckout?.isActive) {
    return `Checked out to ${device.currentCheckout.teamMemberName}`;
  }
  if (device.nextScheduled?.isActive) {
    return `Scheduled for ${device.nextScheduled.teamMemberName}`;
  }
  return 'Available';
}

export function isDeviceAvailable(device: VRPADevice): boolean {
  return !device.currentCheckout?.isActive;
}

export function canScheduleDevice(device: VRPADevice, proposedStartDate: Date): boolean {
  // Can always schedule if no current checkout
  if (!device.currentCheckout?.isActive) return true;
  
  // Can schedule if proposed date is after current checkout ends
  return proposedStartDate >= device.currentCheckout.expectedReturnDate;
}

export function formatUptime(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}

export function calculateDailyUptime(pings: PingHistory[]): number {
  if (pings.length === 0) return 0;
  
  const successfulPings = pings.filter(ping => ping.status === 'online').length;
  return (successfulPings / pings.length) * 100;
}

export function groupPingsByDay(pings: PingHistory[]): Map<string, PingHistory[]> {
  const grouped = new Map<string, PingHistory[]>();
  
  pings.forEach(ping => {
    const dateKey = ping.timestamp.toISOString().split('T')[0];
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(ping);
  });
  
  return grouped;
}

export function generateUptimeHistory(pings: PingHistory[]): DeviceUptime[] {
  const groupedPings = groupPingsByDay(pings);
  const uptimeHistory: DeviceUptime[] = [];
  
  groupedPings.forEach((dayPings, date) => {
    const deviceId = dayPings[0]?.deviceId || '';
    const totalPings = dayPings.length;
    const successfulPings = dayPings.filter(ping => ping.status === 'online').length;
    const uptimePercentage = totalPings > 0 ? (successfulPings / totalPings) * 100 : 0;
    
    uptimeHistory.push({
      deviceId,
      date,
      uptimePercentage,
      totalPings,
      successfulPings
    });
  });
  
  return uptimeHistory.sort((a, b) => a.date.localeCompare(b.date));
}

export function isIPConflict(ip: string, devices: VRPADevice[], excludeDeviceId?: string): boolean {
  return devices.some(device => 
    device.ipAddress === ip && device.id !== excludeDeviceId
  );
}

export function simulatePing(ip: string): Promise<{ status: DeviceStatus; responseTime?: number }> {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Simulate different response scenarios based on IP for demo
      const lastOctet = parseInt(ip.split('.')[3] || '0', 10);
      const random = Math.random();
      
      if (lastOctet % 10 === 0) {
        // Every 10th IP tends to be offline
        resolve({ status: random > 0.8 ? 'offline' : 'online', responseTime: random > 0.8 ? undefined : Math.random() * 50 + 10 });
      } else if (lastOctet % 7 === 0) {
        // Every 7th IP has intermittent issues
        resolve({ status: random > 0.7 ? 'unknown' : 'online', responseTime: random > 0.7 ? undefined : Math.random() * 100 + 20 });
      } else {
        // Most IPs are online
        resolve({ status: random > 0.95 ? 'offline' : 'online', responseTime: random > 0.95 ? undefined : Math.random() * 30 + 5 });
      }
    }, Math.random() * 1000 + 500); // Random delay between 500-1500ms
  });
}