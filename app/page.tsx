import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";

export default function Home() {
  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      {/* 1. The Sidebar (Fixed on the left) */}
      <Sidebar />

      {/* 2. The Main Content Area (Pushed to the right) */}
      <main className="flex-1 ml-64">
        <Dashboard />
      </main>
    </div>
  );
}