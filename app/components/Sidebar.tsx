"use client";

import React from 'react';
import { LayoutDashboard, Bell, FileText, PlusCircle, Home, User, LogOut } from "lucide-react";
import { useAuth } from '@/lib/authContext'; // <--- We import the "Brain" here

export default function Sidebar() {
  // We ask the Brain: "Who is the user?" and "Give me the logout function"
  const { user, logout } = useAuth(); 

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 border-r border-slate-800">
      {/* Logo Section */}
      <div className="p-6">
        <div className="flex items-center gap-2">
            <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold">SS</div>
            <div>
                <h1 className="text-xl font-bold">SS Ges Imm</h1>
                <p className="text-[10px] text-blue-400 tracking-wider font-bold">MAINTENANCE</p>
            </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4 px-4">Navigation</p>
        
        <NavItem icon={<LayoutDashboard size={20} />} label="Tableau de bord" active />
        <NavItem icon={<Bell size={20} />} label="Notifications" />
        <NavItem icon={<FileText size={20} />} label="Mes Demandes" />
        <NavItem icon={<PlusCircle size={20} />} label="Signaler un problème" />
        <NavItem icon={<Home size={20} />} label="Ma Propriété" />
      </nav>

      {/* User Section at Bottom */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
          <div className="bg-blue-600 p-2 rounded-full h-10 w-10 flex items-center justify-center">
            <User size={20} />
          </div>
          <div className="overflow-hidden">
            {/* We display the REAL name and role here */}
            <p className="text-sm font-bold truncate">{user?.name || "Utilisateur"}</p>
            <p className="text-[10px] text-blue-400 font-bold uppercase">{user?.role || "Inconnu"}</p>
          </div>
        </div>
        
        {/* We attached the 'logout' function to this button */}
        <button 
            onClick={logout}
            className="w-full mt-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors py-2"
        >
          <LogOut size={14} /> Déconnexion
        </button>
      </div>
    </div>
  );
}

// Helper component for menu items
function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            active 
            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}>
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </button>
    )
}