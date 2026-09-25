import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '../components/AppSidebar';
import { AppHeader } from '../components/AppHeader';
import { Sheet } from '../components/ui/sheet';

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0 h-full">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* Mobile Drawer Navigation */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen} side="left" className="p-0 border-none">
        <div className="h-full bg-[#0d121d]">
          <AppSidebar
            collapsed={false}
            onToggleCollapse={() => setMobileNavOpen(false)}
            onItemClick={() => setMobileNavOpen(false)}
          />
        </div>
      </Sheet>

      {/* Main Content Viewport */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <AppHeader onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
