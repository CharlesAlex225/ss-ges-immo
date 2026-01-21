"use client"; // Must be client now
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import RouteGuard from "./components/RouteGuard"; // <--- Import Guard

export default function Home() {
  return (
    <RouteGuard> {/* <--- Protect the page */}
      <div className="flex bg-slate-50 min-h-screen font-sans">
        <Sidebar />
        <main className="flex-1 ml-64">
          <Dashboard />
        </main>
      </div>
    </RouteGuard>
  );
}