import { useState, useEffect, useCallback, useRef } from 'react';
import { VRPADevice, PingHistory, TeamMember } from '@/types/vrpa';
import { devicesAPI, teamMembersAPI, pingHistoryAPI } from '@/lib/api';
import { generateUUID } from '@/lib/vrpa-utils';

export function useVRPADevices() {
  const [devices, setDevices] = useState<VRPADevice[] | null>(null);
  const [pingHistory, setPingHistory] = useState<PingHistory[] | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[] | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [devicesData, membersData, historyData] = await Promise.all([
          devicesAPI.getAll(),
          teamMembersAPI.getAll(),
          pingHistoryAPI.getAll()
        ]);
        
        setDevices(devicesData);
        setTeamMembers(membersData);
        setPingHistory(historyData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
        monitoringIntervalRef.current = null;
      }
    };
  }, []);

  // Ping monitoring function
  const pingDevice = useCallback(async (device: VRPADevice) => {
    try {
      // Call backend API to perform real ping
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/devices/${device.id}/ping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Ping request failed');
      }

      const result = await response.json();
      
      const pingRecord: PingHistory = {
        deviceId: device.id,
        timestamp: new Date(result.timestamp),
        status: result.status,
        responseTime: result.responseTime
      };

      // Update local state
      setPingHistory(currentHistory => [...(currentHistory || []), pingRecord]);

      // Update device status in local state
      const updatedDevice = { ...device, status: result.status, updatedAt: new Date(result.timestamp) };
      
      setDevices(currentDevices =>
        (currentDevices || []).map(d =>
          d.id === device.id ? updatedDevice : d
        )
      );
    } catch (error) {
      console.error(`Failed to ping device ${device.name}:`, error);
      
      const pingRecord: PingHistory = {
        deviceId: device.id,
        timestamp: new Date(),
        status: 'unknown'
      };

      try {
        await pingHistoryAPI.create(pingRecord);
        setPingHistory(currentHistory => [...(currentHistory || []), pingRecord]);
      } catch (err) {
        console.error('Failed to save ping record:', err);
      }
      
      const updatedDevice = { ...device, status: 'unknown' as const, updatedAt: new Date() };
      try {
        await devicesAPI.update(device.id, updatedDevice);
        setDevices(currentDevices =>
          (currentDevices || []).map(d =>
            d.id === device.id ? updatedDevice : d
          )
        );
      } catch (err) {
        console.error('Failed to update device status:', err);
      }
    }
  }, []);

  // Store interval ref
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start monitoring all devices
  const startMonitoring = useCallback(() => {
    if (isMonitoring || monitoringIntervalRef.current) return;
    
    setIsMonitoring(true);
    
    // Initial ping for all devices
    (devices || []).forEach(device => {
      pingDevice(device);
    });

    // Set up interval
    monitoringIntervalRef.current = setInterval(() => {
      (devices || []).forEach(device => {
        pingDevice(device);
      });
    }, 60000); // Ping every 60 seconds
  }, [devices, pingDevice, isMonitoring]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
    setIsMonitoring(false);
  }, []);

  // Device management functions
  const addDevice = useCallback(async (deviceData: Omit<VRPADevice, 'id' | 'status' | 'checkoutStatus' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newDevice = await devicesAPI.create({
        ...deviceData,
        status: 'unknown',
        checkoutStatus: 'available'
      });

      setDevices(currentDevices => [...(currentDevices || []), newDevice]);
      
      // Immediately ping the new device
      if (isMonitoring) {
        pingDevice(newDevice);
      }
      
      return newDevice;
    } catch (error) {
      console.error('Failed to add device:', error);
      throw error;
    }
  }, [isMonitoring, pingDevice]);

  const updateDevice = useCallback(async (deviceId: string, updates: Partial<VRPADevice>) => {
    try {
      const device = devices?.find(d => d.id === deviceId);
      if (!device) return;
      
      const updatedDevice = await devicesAPI.update(deviceId, { ...device, ...updates });
      
      setDevices(currentDevices =>
        (currentDevices || []).map(device =>
          device.id === deviceId ? updatedDevice : device
        )
      );
    } catch (error) {
      console.error('Failed to update device:', error);
      throw error;
    }
  }, [devices]);

  const deleteDevice = useCallback(async (deviceId: string) => {
    try {
      await devicesAPI.delete(deviceId);
      setDevices(currentDevices => (currentDevices || []).filter(device => device.id !== deviceId));
    } catch (error) {
      console.error('Failed to delete device:', error);
      throw error;
    }
  }, []);

  const checkoutDevice = useCallback(async (deviceId: string, checkout: Omit<import('@/types/vrpa').Checkout, 'id' | 'deviceId' | 'isActive'>) => {
    const device = devices?.find(d => d.id === deviceId);
    if (!device) throw new Error('Device not found');
    
    const fullCheckout = {
      ...checkout,
      id: generateUUID(),
      deviceId,
      isActive: true
    };

    await updateDevice(deviceId, {
      checkoutStatus: 'checked-out' as const,
      currentCheckout: fullCheckout
    });

    return fullCheckout;
  }, [devices, updateDevice]);

  const returnDevice = useCallback(async (deviceId: string, actualReturnDate?: Date) => {
    const device = devices?.find(d => d.id === deviceId);
    if (!device || !device.currentCheckout) return;
    
    await updateDevice(deviceId, {
      checkoutStatus: 'available' as const,
      currentCheckout: {
        ...device.currentCheckout,
        isActive: false,
        actualReturnDate: actualReturnDate || new Date()
      }
    });
  }, [devices, updateDevice]);

  const scheduleDevice = useCallback(async (deviceId: string, schedule: Omit<import('@/types/vrpa').ScheduledDeployment, 'id' | 'deviceId' | 'isActive'>) => {
    const fullSchedule = {
      ...schedule,
      id: generateUUID(),
      deviceId,
      isActive: true
    };

    await updateDevice(deviceId, {
      nextScheduled: fullSchedule
    });

    return fullSchedule;
  }, [updateDevice]);

  const cancelSchedule = useCallback(async (deviceId: string) => {
    await updateDevice(deviceId, {
      nextScheduled: null as any
    });
  }, [updateDevice]);

  // Get ping history for a specific device
  const getDevicePingHistory = useCallback((deviceId: string, days: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return (pingHistory || []).filter(ping => 
      ping.deviceId === deviceId && new Date(ping.timestamp) >= cutoffDate
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [pingHistory]);

  // Team member management functions
  const addTeamMember = useCallback(async (memberData: Omit<TeamMember, 'id'>) => {
    try {
      const newMember = await teamMembersAPI.create(memberData);
      setTeamMembers(currentMembers => [...(currentMembers || []), newMember]);
      return newMember;
    } catch (error) {
      console.error('Failed to add team member:', error);
      throw error;
    }
  }, []);

  const updateTeamMember = useCallback(async (memberId: string, updates: Partial<TeamMember>) => {
    try {
      const member = teamMembers?.find(m => m.id === memberId);
      if (!member) return;
      
      const updatedMember = await teamMembersAPI.update(memberId, { ...member, ...updates });
      
      setTeamMembers(currentMembers =>
        (currentMembers || []).map(member =>
          member.id === memberId ? updatedMember : member
        )
      );
    } catch (error) {
      console.error('Failed to update team member:', error);
      throw error;
    }
  }, [teamMembers]);

  const removeTeamMember = useCallback(async (memberId: string) => {
    try {
      await teamMembersAPI.delete(memberId);
      setTeamMembers(currentMembers => 
        (currentMembers || []).filter(member => member.id !== memberId)
      );
    } catch (error) {
      console.error('Failed to remove team member:', error);
      throw error;
    }
  }, []);

  return {
    devices,
    teamMembers,
    pingHistory,
    isMonitoring,
    loading,
    startMonitoring,
    stopMonitoring,
    addDevice,
    updateDevice,
    deleteDevice,
    checkoutDevice,
    returnDevice,
    scheduleDevice,
    cancelSchedule,
    getDevicePingHistory,
    addTeamMember,
    updateTeamMember,
    removeTeamMember
  };
}
