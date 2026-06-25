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
    <nav className="fixed bottom-0 left-0 right-0 lg:hidden z-40 px-4 pb-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/60 shadow-xl shadow-black/10 flex overflow-hidden">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-all relative",
                active ? "text-red-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-red-500" />
              )}
              <Icon className={cn("w-5 h-5 transition-transform", active && "scale-110")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
