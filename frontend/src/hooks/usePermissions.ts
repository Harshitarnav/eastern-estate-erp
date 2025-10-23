import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import api from '@/services/api';

interface Permission {
  id: string;
  module: string;
  action: string;
  resource?: string;
  name: string;
}

export function usePermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.employee?.roleId) {
      loadPermissions();
    }
  }, [user]);

  const loadPermissions = async () => {
    try {
      const response = await api.get(`/roles/${user.employee.roleId}/permissions`);
      setPermissions(response.data);
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const can = (module: string, action: string): boolean => {
    if (!permissions.length) return false;
    return permissions.some(p => p.module === module && p.action === action);
  };

  const canAny = (checks: Array<{ module: string; action: string }>): boolean => {
    return checks.some(({ module, action }) => can(module, action));
  };

  const canAll = (checks: Array<{ module: string; action: string }>): boolean => {
    return checks.every(({ module, action }) => can(module, action));
  };

  return {
    permissions,
    loading,
    can,
    canAny,
    canAll,
  };
}
