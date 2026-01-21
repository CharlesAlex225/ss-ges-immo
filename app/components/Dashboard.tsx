"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Ticket, UserRole, TicketPriority } from '../types';
import { StatusBadge } from './StatusBadge';
import { supabase } from '@/lib/supabaseClient'; // <--- Importing the connection

// We keep a mock user for now (since we haven't built Login yet)
const CURRENT_USER = {
  id: "u1",
  name: "Admin Propriétaire",
  role: UserRole.ADMIN
};

const Dashboard: React.FC = () => {
  const user = CURRENT_USER;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // This "Effect" runs when the page loads
  useEffect(() => {
    async function fetchTickets() {
      // 1. Ask Supabase for all tickets
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
      } else if (data) {
        // 2. Convert database data to Dashboard format
        const formattedTickets: Ticket[] = data.map((t: any) => ({
          id: t.id.toString(),
          title: t.category || "Maintenance Request", // Use category as title
          description: t.description,
          status: t.status === 'open' ? 'OPEN' : 'CLOSED',
          priority: (t.urgency?.toUpperCase() as TicketPriority) || 'MEDIUM',
          category: t.category,
          createdAt: t.created_at,
          userId: "unknown"
        }));
        setTickets(formattedTickets);
      }
      setIsLoading(false);
    }

    fetchTickets();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 18) return "Bonjour";
    return "Bonsoir";
  };

  return (
    <div className="space-y-8 p-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{getGreeting()}, {user.name} 👋</h2>
          <p className="text-slate-500 mt-1">Aperçu général de l'activité de votre parc immobilier.</p>
        </div>
        
        {/* We will make this button work in the next step! */}
        <Link href="/new-ticket" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-sm transition shadow-lg shadow-blue-500/20 text-center flex items-center gap-2">
            <span>+</span> Nouvelle Demande
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tickets Ouverts</span>
           <span className="text-4xl font-black text-slate-900">{tickets.filter(t => t.status === 'OPEN').length}</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">En cours</span>
           <span className="text-4xl font-black text-blue-600">{tickets.filter(t => t.status === 'IN_PROGRESS').length}</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Archivé</span>
           <span className="text-4xl font-black text-slate-300">{tickets.filter(t => t.status === 'CLOSED').length}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Activité Récente</h3>
        </div>
        
        <div className="grid gap-4">
          {isLoading ? (
             <div className="p-8 text-center text-slate-400">Chargement...</div>
          ) : tickets.length === 0 ? (
             <div className="p-8 text-center text-slate-400 italic">Aucun ticket trouvé.</div>
          ) : (
            tickets.map(ticket => (
              <div key={ticket.id} className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group relative overflow-hidden cursor-pointer">
                <div className="flex items-start justify-between relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-mono font-bold text-blue-500 uppercase">#{ticket.id}</span>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <h4 className="font-black text-slate-900 group-hover:text-blue-600 transition text-lg leading-tight">{ticket.title}</h4>
                    <p className="text-sm text-slate-500 line-clamp-1 mb-2 font-medium">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      <span>{new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</span>
                      <span>•</span>
                      <span>{ticket.category}</span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
                      ticket.priority === 'URGENT' || ticket.priority === 'HIGH' ? 'border-red-100 text-red-600 bg-red-50' : 'border-slate-100 text-slate-400 bg-slate-50'
                  }`}>
                    {ticket.priority}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;