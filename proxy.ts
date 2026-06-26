import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const proxy = auth(function proxy(req: NextRequest & { auth: any }) {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = session?.user ? (session.user as any).role : null;

  // Admin routes — must be logged in as admin
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Customer routes — must be logged in as customer
  if (pathname.startsWith("/customer")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (role !== "customer") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Login page — redirect already-authenticated users to their dashboard
  if (pathname === "/login") {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    if (role === "customer") {
      return NextResponse.redirect(new URL("/customer/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/customer/:path*", "/login"],
};
