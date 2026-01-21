"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/app/types';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Edit, Plus, Trash2, User as UserIcon } from 'lucide-react';
import Sidebar from '../components/Sidebar'; // Assuming you want the sidebar here too

export default function UserAdmin() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase.from('people').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  };

  const handleOpenModal = (user?: any) => {
    setError(null);
    setEditingUser(user ? { ...user } : {
      name: '',
      phone: '+33',
      email: '',
      role: 'TENANT',
      avatar: '', // We will generate this automatically
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingUser.name || !editingUser.phone) {
      setError("Nom et téléphone obligatoires.");
      return;
    }
    
    setSaving(true);
    
    // Auto-generate avatar if missing
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(editingUser.name)}&background=random`;

    const userData = {
        name: editingUser.name,
        phone: editingUser.phone,
        email: editingUser.email,
        role: editingUser.role,
        // If avatar is empty, use the generated one
        // Note: In a real app, we would upload to Supabase Storage
    };

    let result;
    if (editingUser.id) {
      // UPDATE
      result = await supabase.from('people').update(userData).eq('id', editingUser.id);
    } else {
      // CREATE
      result = await supabase.from('people').insert(userData);
    }

    if (result.error) {
        console.error(result.error);
        setError("Erreur: " + result.error.message);
    } else {
        await fetchUsers();
        setIsModalOpen(false);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
      if(!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
      await supabase.from('people').delete().eq('id', id);
      fetchUsers();
  }

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
            <div>
            <button onClick={() => router.back()} className="text-blue-600 text-xs font-black uppercase tracking-widest hover:underline mb-2 flex items-center gap-1">
                <ArrowLeft size={12}/> Retour
            </button>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestion des Utilisateurs</h2>
            <p className="text-slate-500 text-sm">Gérez les accès à la plateforme.</p>
            </div>
            <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
            <Plus size={16} /> Créer un utilisateur
            </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utilisateur</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Rôle</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                            {/* Uses UI Avatars for instant images */}
                            <img src={`https://ui-avatars.com/api/?name=${u.name}&background=random`} alt={u.name} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900 leading-tight">{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono italic">{u.email || u.phone}</span>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded uppercase border tracking-tighter ${
                        u.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                        u.role === 'TENANT' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                        {u.role}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(u)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                            <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                            <Trash2 size={16} />
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>

        {isModalOpen && editingUser && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {editingUser.id ? "Modifier" : "Nouveau Compte"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <div className="p-6 space-y-4">
                {error && <div className="p-3 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-xl border border-red-100">{error}</div>}
                
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Nom complet</label>
                    <input type="text" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="ex: Alice Durant" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Téléphone</label>
                    <input type="tel" value={editingUser.phone} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="+336..." />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Email</label>
                    <input type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="email@exemple.com" />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Rôle</label>
                    <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="TENANT">LOCATAIRE</option>
                        <option value="OWNER">PROPRIÉTAIRE</option>
                        <option value="ADMIN">ADMINISTRATEUR</option>
                    </select>
                </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold text-xs uppercase tracking-widest">Annuler</button>
                <button disabled={saving} onClick={handleSave} className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 disabled:opacity-50">
                    {saving ? "Sauvegarde..." : "Enregistrer"}
                </button>
                </div>
            </div>
            </div>
        )}
      </main>
    </div>
  );
}