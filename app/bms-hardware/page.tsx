// app/bms-hardware/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, RefreshCw, Shield } from "lucide-react";
import { LoadingSpinnerCentered } from "@/components/common/LoadingSpinner";
import { ErrorDisplayCentered } from "@/components/common/ErrorDisplay";
import { useBmsDevices } from "@/lib/hooks/useBmsDevices";
import { DeviceCard } from "@/features/bms-hardware/components/DeviceCard";
import { DeviceDetails } from "@/features/bms-hardware/components/DeviceDetails";
import { DeviceStats } from "@/features/bms-hardware/components/DeviceStats";
import type { BmsDevice } from "@/types/bms";

export default function BMSHardwarePage() {
  const { devices, loading, error, loadDevices } = useBmsDevices();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<BmsDevice | null>(null);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinnerCentered text="Loading BMS devices..." />;
  }

  if (error) {
    return (
      <ErrorDisplayCentered
        title="Error loading devices"
        message={error.message}
        onRetry={loadDevices}
      />
    );
  }

  return (
    <div className="space-y-6">
      {!selectedDevice ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">BMS Hardware</h1>
              <p className="text-gray-600">
                Manage building management system devices and equipment
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadDevices}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Device
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <DeviceStats devices={devices} />

          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search devices..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Badge variant="secondary">
              {filteredDevices.length}{" "}
              {filteredDevices.length === 1 ? "device" : "devices"}
            </Badge>
          </div>

          {/* Devices Grid */}
          {filteredDevices.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDevices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onViewDetails={setSelectedDevice}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No devices found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Get started by adding your first device"}
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add First Device
              </Button>
            </div>
          )}
        </>
      ) : (
        <DeviceDetails
          device={selectedDevice}
          onBack={() => setSelectedDevice(null)}
        />
      )}
    </div>
  );
}
