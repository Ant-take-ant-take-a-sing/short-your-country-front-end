"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import BottomNavbar from "@/components/layout/BottomNavbar";
import { ReactNode } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname === "/";

  return (
    <>
      {!isDashboard && <Navbar />}
      <main className="mx-auto w-full">{children}</main>
    </>
  );
}
