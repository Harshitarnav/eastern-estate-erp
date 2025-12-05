'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronDown, Building2, X, Loader2 } from 'lucide-react';
import { usePropertyStore } from '@/store/propertyStore';
import { propertiesService } from '@/services/properties.service';
import { useAuth } from '@/hooks/useAuth';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function PropertySelector() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const {
    selectedProperties,
    properties,
    isMultiSelectMode,
    setProperties,
    setMultiSelectMode,
    toggleProperty,
    selectAll,
    clearSelection,
    getSelectedPropertyNames,
  } = usePropertyStore();

  // Determine if user is admin - check multiple possible formats
  const isAdmin = (() => {
    console.log('[PropertySelector] User object:', user);
    console.log('[PropertySelector] User roles:', user?.roles);
    
    if (!user?.roles || !Array.isArray(user.roles)) {
      console.log('[PropertySelector] No roles found, defaulting to admin=true');
      return true; // Default to admin for now
    }
    
    const result = user.roles.some((role: any) => {
      console.log('[PropertySelector] Checking role:', role);
      
      // Handle both role object and string
      const roleName = typeof role === 'string' ? role : (role?.name || role?.roleName || '');
      const normalizedRole = roleName.toUpperCase().replace(/[-_\s]/g, '');
      
      console.log('[PropertySelector] Normalized role:', normalizedRole);
      
      // Check for admin roles
      const isAdminRole = (
        normalizedRole.includes('ADMIN') ||
        normalizedRole.includes('SUPERADMIN') || 
        normalizedRole.includes('SALESGM') ||
        normalizedRole === 'GM'
      );
      
      console.log('[PropertySelector] Is admin role?', isAdminRole);
      return isAdminRole;
    });
    
    console.log('[PropertySelector] Final isAdmin result:', result);
    return result;
  })();

  // Load properties on mount
  useEffect(() => {
    loadProperties();
  }, []);

  // Set multi-select mode based on user role
  useEffect(() => {
    console.log('[PropertySelector] Setting multi-select mode:', isAdmin);
    if (isAdmin !== undefined) {
      setMultiSelectMode(isAdmin);
      console.log('[PropertySelector] Multi-select mode set to:', isAdmin);
    }
  }, [isAdmin, setMultiSelectMode]);

  // Log current state
  console.log('[PropertySelector] Current isMultiSelectMode:', isMultiSelectMode);
  console.log('[PropertySelector] Selected properties:', selectedProperties);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await propertiesService.getProperties();
      const propertyList = Array.isArray(data) ? data : data.data || [];
      
      console.log('[PropertySelector] Loaded properties:', propertyList.length);
      console.log('[PropertySelector] Properties data:', propertyList);
      
      const mappedProperties = propertyList.map(p => ({
        id: p.id,
        name: p.name,
        location: p.location || p.city || '',
        type: p.type || 'RESIDENTIAL',
      }));
      
      setProperties(mappedProperties);
      console.log('[PropertySelector] Mapped properties:', mappedProperties);
      console.log('[PropertySelector] Current selectedProperties before auto-select:', selectedProperties);
      // NOTE: Auto-select disabled to allow "All properties" (no filter) view.
    } catch (error) {
      console.error('[PropertySelector] Failed to load properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedPropertiesData = properties.filter(p => 
    selectedProperties.includes(p.id)
  );

  const displayText = loading 
    ? 'Loading properties...' 
    : properties.length === 0 
      ? 'No properties found' 
      : selectedProperties.length === 0
        ? 'All properties'
        : getSelectedPropertyNames();
      
  const allSelected = selectedProperties.length === properties.length && properties.length > 0;

  console.log('[PropertySelector] Display state:', {
    loading,
    propertiesCount: properties.length,
    selectedCount: selectedProperties.length,
    displayText
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="min-w-[280px] justify-between h-10 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {loading ? (
              <Loader2 className="h-4 w-4 text-blue-600 flex-shrink-0 animate-spin" />
            ) : (
              <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
            )}
            <span className="font-medium text-gray-900 truncate">
              {displayText}
            </span>
            {selectedPropertiesData.length > 1 && (
              <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700 text-xs">
                {selectedPropertiesData.length}
              </Badge>
            )}
          </div>
          <ChevronDown className={`ml-2 h-4 w-4 flex-shrink-0 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search properties..." className="h-9" />
          <CommandEmpty>
            <div className="py-6 text-center text-sm text-gray-500">
              {loading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <p>Loading properties...</p>
                </div>
              ) : properties.length === 0 ? (
                <div className="flex flex-col items-center gap-2">
                  <Building2 className="h-8 w-8 text-gray-300" />
                  <p>No properties found.</p>
                  <p className="text-xs text-gray-400">Please add properties first.</p>
                </div>
              ) : (
                'No matching properties found.'
              )}
            </div>
          </CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            <CommandItem
              key="__all"
              value="__all"
              onSelect={() => {
                clearSelection();
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <div>
                  <div className="font-medium text-sm text-gray-900">All properties</div>
                  <div className="text-xs text-gray-500">Show leads across every property</div>
                </div>
              </div>
              {selectedProperties.length === 0 && <Check className="h-4 w-4 ml-auto text-blue-600" />}
            </CommandItem>
            {/* All Properties Option (Admin only) */}
            {isMultiSelectMode && (
              <>
                <CommandItem
                  onSelect={() => {
                    if (allSelected) {
                      clearSelection();
                    } else {
                      selectAll();
                    }
                  }}
                  className="flex items-center gap-2 py-3 cursor-pointer"
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    allSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                  }`}>
                    {allSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">All Properties</div>
                    <div className="text-xs text-gray-500">
                      View data across all {properties.length} properties
                    </div>
                  </div>
                  {allSelected && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Selected
                    </Badge>
                  )}
                </CommandItem>
                <div className="h-px bg-gray-200 my-2" />
              </>
            )}

            {/* Individual Properties */}
            {properties.map((property) => {
              const isSelected = selectedProperties.includes(property.id);
              
              return (
                <CommandItem
                  key={property.id}
                  value={property.name}
                  onSelect={() => {
                    toggleProperty(property.id);
                    if (!isMultiSelectMode) {
                      setOpen(false);
                    }
                  }}
                  className="flex items-center gap-3 py-3 cursor-pointer"
                >
                  {isMultiSelectMode ? (
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                  ) : (
                    <div className="w-4 h-4 flex items-center justify-center">
                      {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                    </div>
                  )}
                  
                  <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {property.name}
                    </div>
                    {property.location && (
                      <div className="text-xs text-gray-500 truncate">
                        📍 {property.location}
                      </div>
                    )}
                  </div>
                  
                  {isSelected && !isMultiSelectMode && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                      Active
                    </Badge>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>

        {/* Footer Actions (Multi-select mode) */}
        {isMultiSelectMode && selectedProperties.length > 0 && (
          <div className="border-t bg-gray-50 p-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedProperties.length} of {properties.length} selected
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  clearSelection();
                  setOpen(false);
                }}
                className="h-7 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => setOpen(false)}
                className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
              >
                Apply Filter
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Property Badge Component - Shows selected properties inline
export function PropertyBadge() {
  const { selectedProperties, properties } = usePropertyStore();
  
  const selectedPropertiesData = properties.filter(p => 
    selectedProperties.includes(p.id)
  );

  if (selectedPropertiesData.length === 0) return null;
  if (selectedPropertiesData.length === properties.length) {
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
        All Properties
      </Badge>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {selectedPropertiesData.slice(0, 3).map((property) => (
        <Badge 
          key={property.id} 
          variant="secondary" 
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          {property.name}
        </Badge>
      ))}
      {selectedPropertiesData.length > 3 && (
        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
          +{selectedPropertiesData.length - 3} more
        </Badge>
      )}
    </div>
  );
}
