/**
 * TenantSwitcher Component
 * @author sanat.k.mahapatra
 * 
 * Dropdown menu for switching between tenants
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  slug: string;
}

interface TenantSwitcherProps {
  tenants: Tenant[];
  currentSlug: string;
}

export function TenantSwitcher({ tenants, currentSlug }: TenantSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentTenant = tenants.find((t) => t.slug === currentSlug);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
      >
        <span className="text-sm font-medium">{currentTenant?.name || "Select Tenant"}</span>
        <ChevronDown className={`w-4 h-4 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 min-w-48">
          {tenants.map((tenant) => (
            <Link
              key={tenant.id}
              href={`/${tenant.slug}`}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2 text-sm transition ${
                tenant.slug === currentSlug
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
            >
              {tenant.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
