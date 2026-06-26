"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Bike, FileText, CreditCard,
  BarChart3, Settings, LogOut, Menu, X, FileBarChart
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/motorcycles", icon: Bike, label: "Motorcycles" },
  { href: "/admin/contracts", icon: FileText, label: "Contracts" },
  { href: "/admin/payments", icon: CreditCard, label: "Payments" },
  { href: "/admin/reports", icon: FileBarChart, label: "Reports" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavLink = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => {
    const active = pathname.startsWith(href);
    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
          active ? "bg-white/20 text-white" : "text-red-200 hover:text-white hover:bg-white/10"
        )}
      >
        <Icon className={cn("w-4 h-4 shrink-0 transition-colors", active ? "text-white" : "text-red-300 group-hover:text-white")} />
        <span>{label}</span>
        {active && <div className="ml-auto w-1 h-4 rounded-full bg-white/60" />}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <Logo white size="sm" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-red-300/70 text-[10px] font-semibold uppercase tracking-[0.12em] px-3 mb-3">Navigation</p>
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 space-y-0.5 border-t border-white/[0.06] pt-3">
        <Link
          href="/admin/settings"
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
            pathname.startsWith("/admin/settings") ? "bg-white/20 text-white" : "text-red-200 hover:text-white hover:bg-white/10"
          )}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Link>
        <button
          onClick={async () => { await signOut({ redirect: false }); window.location.href = "/login"; }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-200 hover:bg-black/20 hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-3.5 left-4 z-50 w-9 h-9 rounded-lg flex items-center justify-center shadow-lg"
        style={{ background: "#b91c1c" }}
      >
        {open ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-white" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn("lg:hidden fixed top-0 left-0 h-full w-60 z-50 transition-transform duration-300", open ? "translate-x-0" : "-translate-x-full")}
        style={{ background: "linear-gradient(180deg, #b91c1c 0%, #7f1d1d 100%)" }}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 h-screen sticky top-0 shrink-0" style={{ background: "linear-gradient(180deg, #b91c1c 0%, #7f1d1d 100%)" }}>
        <SidebarContent />
      </aside>
    </>
  );
}
