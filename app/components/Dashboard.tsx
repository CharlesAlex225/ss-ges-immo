"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link'; // Changed to Next Link
import { Ticket, TicketPriority, UserRole } from '../types';
import { StatusBadge } from './StatusBadge';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/authContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      if (!user) return;

      let query = supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (user.role !== UserRole.ADMIN) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (data) {
        const formattedTickets: Ticket[] = data.map((t: any) => ({
          id: t.id.toString(),
          title: t.title || t.category || "Sans titre",
          description: t.description,
          status: t.status === 'open' ? 'OPEN' : 'CLOSED',
          priority: (t.urgency?.toUpperCase() as TicketPriority) || 'MEDIUM',
          category: t.category,
          createdAt: t.created_at,
          userId: t.user_id
        }));
        setTickets(formattedTickets);
      }
      setIsLoading(false);
    }

    fetchTickets();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    return hour < 18 ? "Bonjour" : "Bonsoir";
  };

  if (!user) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="space-y-8 p-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {getGreeting()}, {user.name} 👋
          </h2>
          <p className="text-slate-500 mt-1">
            {user.role === UserRole.TENANT 
              ? "Voici le suivi de vos demandes de maintenance." 
              : "Aperçu général de l'activité de votre parc immobilier."}
          </p>
        </div>
        
        {/* Only show 'New Request' button if Tenant */}
        {user.role === UserRole.TENANT && (
          <Link href="/new-ticket" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-sm transition shadow-lg shadow-blue-500/20 text-center flex items-center gap-2">
              <span>+</span> Nouvelle Demande
          </Link>
        )}
        
        {/* If Admin, show User Management button */}
        {user.role === UserRole.ADMIN && (
          <Link href="/users" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-black text-sm transition shadow-lg text-center flex items-center gap-2">
              Gérer les Utilisateurs
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tickets Ouverts</span>
           <span className="text-4xl font-black text-slate-900">{tickets.filter(t => t.status !== 'CLOSED').length}</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">En cours</span>
           <span className="text-4xl font-black text-blue-600">{tickets.filter(t => t.status === 'IN_PROGRESS').length}</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Archivés</span>
           <span className="text-4xl font-black text-slate-300">{tickets.filter(t => t.status === 'CLOSED').length}</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Activité Récente</h3>
        
        <div className="grid gap-4">
          {isLoading ? (
             <div className="p-8 text-center text-slate-400">Chargement...</div>
          ) : tickets.length === 0 ? (
             <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                <p className="text-slate-400 font-bold mb-2">Aucune demande trouvée</p>
                {user.role === UserRole.TENANT && (
                    <Link href="/new-ticket" className="text-blue-600 text-sm font-bold hover:underline">
                        Créer votre première demande &rarr;
                    </Link>
                )}
             </div>
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