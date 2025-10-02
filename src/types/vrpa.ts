export type VRPAType = 'Hyper-V' | 'VMWare' | 'Physical' | 'Custom';

export type DeviceStatus = 'online' | 'offline' | 'unknown';

export type CheckoutStatus = 'available' | 'checked-out' | 'scheduled';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
}

export interface VRPADevice {
  id: string;
  name: string;
  type: VRPAType;
  customType?: string; // For future custom types
  ipAddress: string;
  rootPassword: string;
  sharefileLink: string;
  status: DeviceStatus;
  checkoutStatus: CheckoutStatus;
  currentCheckout?: Checkout;
  nextScheduled?: ScheduledDeployment;
  createdAt: Date;
  updatedAt: Date;
}

export interface Checkout {
  id: string;
  deviceId: string;
  teamMemberId: string;
  teamMemberName: string;
  clientName: string;
  checkoutDate: Date;
  expectedReturnDate: Date;
  actualReturnDate?: Date;
  notes?: string;
  isActive: boolean;
}

export interface ScheduledDeployment {
  id: string;
  deviceId: string;
  teamMemberId: string;
  teamMemberName: string;
  clientName: string;
  scheduledDate: Date;
  expectedEndDate: Date;
  notes?: string;
  isActive: boolean;
}

export interface PingHistory {
  deviceId: string;
  timestamp: Date;
  status: DeviceStatus;
  responseTime?: number; // in milliseconds
}

export interface DeviceUptime {
  deviceId: string;
  date: string; // YYYY-MM-DD format
  uptimePercentage: number;
  totalPings: number;
  successfulPings: number;
}