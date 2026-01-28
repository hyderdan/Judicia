import { useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { DashboardSidebar } from "./Dashboardsidebar";
import { PageTransition } from "./Pagetransition";
import { Menu } from "lucide-react";
import { Button } from "../ui/button";
import { NotificationCenter } from "../shared/NotificationCenter";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "admin" | "police" | "court" | "user";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <DashboardSidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
          <Button
            className="p-2 hover:bg-accent rounded-md"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="font-semibold gradient-text">Virtual Court</h1>
          <NotificationCenter />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 relative">
          <div className="hidden lg:block absolute top-6 right-8 z-30">
            <NotificationCenter />
          </div>
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
