import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from '../components/TopNav';

const DashboardLayout = () => {
  return (
    <>
      {/* Fixed ambient background canvas */}
      <div className="ambient-bg" aria-hidden="true">
        <div className="ambient-teal" />
      </div>

      {/* App shell */}
      <div className="flex flex-col h-screen overflow-hidden relative" style={{ zIndex: 1 }}>
        <TopNav />

        <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-10 flex flex-col items-center">
          <div className="w-full max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;
