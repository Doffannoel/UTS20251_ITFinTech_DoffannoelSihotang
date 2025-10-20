"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/shared/Footer/Footer";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Don't show header on login, register, and admin pages
  const showHeader = pathname && pathname !== "/" && pathname !== "/register" && pathname !== "/login" && !pathname.startsWith("/admin") && !pathname.startsWith("/login/admin");

  // Always show footer
  const showFooter = true;

  return (
    <>
      {showHeader && <Header />}
      {children}
      {showFooter && <Footer />}
    </>
  );
}
