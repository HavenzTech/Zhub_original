"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DocumentTypesAdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/settings");
  }, [router]);

  return null;
}
