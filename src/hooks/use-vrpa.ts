import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './use-local-storage';
import { VRPADevice, PingHistory, DeviceStatus, TeamMember } from '@/types/vrpa';
import { simulatePing, generateId } from '@/lib/vrpa-utils';

export function useVRPADevices() {
  const [devices, setDevices] = useLocalStorage<VRPADevice[]>('vrpa-devices', []);
  const [pingHistory, setPingHistory] = useLocalStorage<PingHistory[]>('ping-history', []);
  const [teamMembers, setTeamMembers] = useLocalStorage<TeamMember[]>('team-members', []);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Initialize with default team members if empty
  useEffect(() => {
    if (teamMembers && teamMembers.length === 0) {
      setTeamMembers([
        { id: generateId(), name: 'John Smith', email: 'john.smith@company.com' },
        { id: generateId(), name: 'Sarah Johnson', email: 'sarah.johnson@company.com' },
        { id: generateId(), name: 'Mike Chen', email: 'mike.chen@company.com' },
        { id: generateId(), name: 'Emily Davis', email: 'emily.davis@company.com' }
      ]);
    }
  }, [teamMembers, setTeamMembers]);

  // Ping monitoring function
  const pingDevice = useCallback(async (device: VRPADevice) => {
    try {
      const result = await simulatePing(device.ipAddress);
      const pingRecord: PingHistory = {
        deviceId: device.id,
        timestamp: new Date(),
        status: result.status,
        responseTime: result.responseTime
      };

      // Update ping history
      setPingHistory(currentHistory => {
        const newHistory = [...(currentHistory || []), pingRecord];
        // Keep only last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return newHistory.filter(ping => ping.timestamp >= thirtyDaysAgo);
      });

      // Update device status
      setDevices(currentDevices =>
        (currentDevices || []).map(d =>
          d.id === device.id ? { ...d, status: result.status, updatedAt: new Date() } : d
        )
      );
    } catch (error) {
      console.error(`Failed to ping device ${device.name}:`, error);
      
      const pingRecord: PingHistory = {
        deviceId: device.id,
        timestamp: new Date(),
        status: 'unknown'
      };

      setPingHistory(currentHistory => [...(currentHistory || []), pingRecord]);
      
      setDevices(currentDevices =>
        (currentDevices || []).map(d =>
          d.id === device.id ? { ...d, status: 'unknown', updatedAt: new Date() } : d
        )
      );
    }
  }, [setPingHistory, setDevices]);

  // Start monitoring all devices
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    
    const monitoringInterval = setInterval(() => {
      (devices || []).forEach(device => {
        pingDevice(device);
      });
    }, 30000); // Ping every 30 seconds

    // Initial ping for all devices
    (devices || []).forEach(device => {
      pingDevice(device);
    });

    return () => {
      clearInterval(monitoringInterval);
      setIsMonitoring(false);
    };
  }, [devices, pingDevice, isMonitoring]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Device management functions
  const addDevice = useCallback((deviceData: Omit<VRPADevice, 'id' | 'status' | 'checkoutStatus' | 'createdAt' | 'updatedAt'>) => {
    const newDevice: VRPADevice = {
      ...deviceData,
      id: generateId(),
      status: 'unknown',
      checkoutStatus: 'available',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setDevices(currentDevices => [...(currentDevices || []), newDevice]);
    
    // Immediately ping the new device
    if (isMonitoring) {
      pingDevice(newDevice);
    }
    
    return newDevice;
  }, [setDevices, isMonitoring, pingDevice]);

  const updateDevice = useCallback((deviceId: string, updates: Partial<VRPADevice>) => {
    setDevices(currentDevices =>
      (currentDevices || []).map(device =>
        device.id === deviceId
          ? { ...device, ...updates, updatedAt: new Date() }
          : device
      )
    );
  }, [setDevices]);

  const deleteDevice = useCallback((deviceId: string) => {
    setDevices(currentDevices => (currentDevices || []).filter(device => device.id !== deviceId));
    
    // Also clean up ping history for this device
    setPingHistory(currentHistory => 
      (currentHistory || []).filter(ping => ping.deviceId !== deviceId)
    );
  }, [setDevices, setPingHistory]);

  const checkoutDevice = useCallback((deviceId: string, checkout: Omit<import('@/types/vrpa').Checkout, 'id' | 'deviceId' | 'isActive'>) => {
    const checkoutId = generateId();
    const fullCheckout = {
      ...checkout,
      id: checkoutId,
      deviceId,
      isActive: true
    };

    setDevices(currentDevices =>
      (currentDevices || []).map(device =>
        device.id === deviceId
          ? {
              ...device,
              checkoutStatus: 'checked-out' as const,
              currentCheckout: fullCheckout,
              updatedAt: new Date()
            }
          : device
      )
    );

    return fullCheckout;
  }, [setDevices]);

  const returnDevice = useCallback((deviceId: string, actualReturnDate?: Date) => {
    setDevices(currentDevices =>
      (currentDevices || []).map(device =>
        device.id === deviceId && device.currentCheckout
          ? {
              ...device,
              checkoutStatus: 'available' as const,
              currentCheckout: {
                ...device.currentCheckout,
                isActive: false,
                actualReturnDate: actualReturnDate || new Date()
              },
              updatedAt: new Date()
            }
          : device
      )
    );
  }, [setDevices]);

  const scheduleDevice = useCallback((deviceId: string, schedule: Omit<import('@/types/vrpa').ScheduledDeployment, 'id' | 'deviceId' | 'isActive'>) => {
    const scheduleId = generateId();
    const fullSchedule = {
      ...schedule,
      id: scheduleId,
      deviceId,
      isActive: true
    };

    setDevices(currentDevices =>
      (currentDevices || []).map(device =>
        device.id === deviceId
          ? {
              ...device,
              nextScheduled: fullSchedule,
              updatedAt: new Date()
            }
          : device
      )
    );

    return fullSchedule;
  }, [setDevices]);

  // Get ping history for a specific device
  const getDevicePingHistory = useCallback((deviceId: string, days: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return (pingHistory || []).filter(ping => 
      ping.deviceId === deviceId && ping.timestamp >= cutoffDate
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [pingHistory]);

  // Team member management functions
  const addTeamMember = useCallback((memberData: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...memberData,
      id: generateId()
    };

    setTeamMembers(currentMembers => [...(currentMembers || []), newMember]);
    return newMember;
  }, [setTeamMembers]);

  const updateTeamMember = useCallback((memberId: string, updates: Partial<TeamMember>) => {
    setTeamMembers(currentMembers =>
      (currentMembers || []).map(member =>
        member.id === memberId
          ? { ...member, ...updates }
          : member
      )
    );
  }, [setTeamMembers]);

  const removeTeamMember = useCallback((memberId: string) => {
    setTeamMembers(currentMembers => 
      (currentMembers || []).filter(member => member.id !== memberId)
    );
  }, [setTeamMembers]);

  return {
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
    getDevicePingHistory,
    setTeamMembers,
    addTeamMember,
    updateTeamMember,
    removeTeamMember
  };
}