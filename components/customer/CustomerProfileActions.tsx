"use client";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function CustomerProfileActions() {
  return (
    <Button
      variant="outline"
      className="w-full text-red-600 border-red-200 hover:bg-red-50"
      onClick={async () => { await signOut({ redirect: false }); window.location.href = "/login"; }}
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sign Out
    </Button>
  );
}
