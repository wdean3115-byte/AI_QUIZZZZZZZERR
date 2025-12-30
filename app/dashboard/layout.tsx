// app/dashboard/layout.tsx
"use client";

import { ReactNode } from "react";
import Sidebar from "./sidebar";
import UserSync from "../../components/user-sync";
import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex bg-[#f7f7f7]">
      {/* Sidebar */}
      <UserSync />
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-14 bg-white border-b flex items-center justify-between px-6">
          <h1 className="font-semibold text-sm text-gray-600">Quiz app</h1>
          <div className="flex items-center gap-4">
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
