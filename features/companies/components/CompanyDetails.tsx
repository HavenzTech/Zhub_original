"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Company, IotMetric } from "@/types/bms";
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { toast } from "sonner";
import {
  Building2,
  Edit,
  DollarSign,
  Calendar,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import {
  getStatusColor,
  formatCurrency,
  formatDate,
  getTimeAgo,
} from "../utils/companyHelpers";
import { IotMetricsDashboard } from "./IotMetricsDashboard";

interface CompanyDetailsProps {
  company: Company;
  onEdit: (company: Company) => void;
}

export function CompanyDetails({ company, onEdit }: CompanyDetailsProps) {
  const [iotMetrics, setIotMetrics] = useState<IotMetric[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [imageError, setImageError] = useState(false);

  const loadIotMetrics = async () => {
    if (!company.id) return;
    try {
      setLoadingMetrics(true);
      const data = await bmsApi.iotMetrics.getByCompany(company.id);
      setIotMetrics(data as IotMetric[]);
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to load IoT metrics";
      toast.error(errorMessage);
      console.error("Error loading IoT metrics:", err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    loadIotMetrics();
  }, [company.id]);

  return (
    <div className="space-y-6">
      {/* Company Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {company.logoUrl && !imageError ? (
                <Image
                  src={company.logoUrl}
                  alt={company.name}
                  className="rounded-xl object-cover"
                  width={64}
                  height={64}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {company.name}
                </h1>
                <p className="text-gray-600">{company.industry || "N/A"}</p>
                <Badge className={getStatusColor(company.status)}>
                  {company.status}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {authService.hasPermission("update", "company") && (
                <Button variant="outline" onClick={() => onEdit(company)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Company
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(company.annualRevenue ?? undefined)}
              </div>
              <div className="text-sm text-gray-600">Annual Revenue</div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Building2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {company.status}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900">
                {company.createdAt ? formatDate(company.createdAt) : "N/A"}
              </div>
              <div className="text-sm text-gray-600">Created</div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900">
                {company.updatedAt ? getTimeAgo(company.updatedAt) : "N/A"}
              </div>
              <div className="text-sm text-gray-600">Last Updated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.contactEmail && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{company.contactEmail}</span>
              </div>
            )}
            {company.contactPhone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{company.contactPhone}</span>
              </div>
            )}
            {company.locationAddress && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm">
                  {[
                    company.locationAddress,
                    company.locationCity,
                    company.locationProvince,
                    company.locationPostalCode,
                    company.locationCountry,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Company Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Company ID</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {company.id ? `${company.id.slice(0, 8)}...` : "N/A"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Industry</span>
              <span className="text-sm font-medium">
                {company.industry || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Created At</span>
              <span className="text-sm font-medium">
                {company.createdAt ? formatDate(company.createdAt) : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm font-medium">
                {company.updatedAt ? formatDate(company.updatedAt) : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IoT Metrics Dashboard */}
      <IotMetricsDashboard
        metrics={iotMetrics}
        loading={loadingMetrics}
        onRefresh={loadIotMetrics}
      />
    </div>
  );
}
