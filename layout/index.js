"use client";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import Login from "../components/login";

const Layout = ({ children }) => {
  const { status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (status !== "authenticated") {
    return <Login />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1  bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
