"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CreditCard, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/customer/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/customer/payments", icon: CreditCard, label: "Pay" },
  { href: "/customer/history", icon: Clock, label: "History" },
  { href: "/customer/profile", icon: User, label: "Profile" },
];


export function CustomerNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-40">
      <div className="flex">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                active ? "text-red-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon className={cn("w-5 h-5", active && "text-red-600")} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
