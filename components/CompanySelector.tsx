"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth";
import { bmsApi } from "@/lib/services/bmsApi";
import { Building2, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Company } from "@/lib/types/auth";

export function CompanySelector() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const auth = authService.getAuth();
    if (auth) {
      setCompanies(auth.companies);
      setCurrentCompanyId(auth.currentCompanyId);
    }
  }, []);

  const currentCompany = companies.find(
    (c) => c.companyId === currentCompanyId
  );

  const handleSelectCompany = (companyId: string) => {
    // Update auth service
    authService.setCurrentCompanyId(companyId);

    // Update bmsApi
    bmsApi.setCompanyId(companyId);

    // Update local state
    setCurrentCompanyId(companyId);
    setOpen(false);

    // Reload the page to refresh data for new company
    router.refresh();
    window.location.reload();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 border-red-200";
      case "member":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "viewer":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Don't show selector if user only has one company
  if (companies.length <= 1) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[280px] justify-between"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">
              {currentCompany
                ? currentCompany.companyName
                : "Select company..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Search companies..." />
          <CommandEmpty>No company found.</CommandEmpty>
          <CommandGroup>
            {companies.map((company) => (
              <CommandItem
                key={company.companyId}
                value={company.companyName}
                onSelect={() => handleSelectCompany(company.companyId)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentCompanyId === company.companyId
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                <div className="flex items-center justify-between flex-1">
                  <span className="truncate">{company.companyName}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "ml-2 text-xs capitalize",
                      getRoleBadgeColor(company.role)
                    )}
                  >
                    {company.role}
                  </Badge>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
