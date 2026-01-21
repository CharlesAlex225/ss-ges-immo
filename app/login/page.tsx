"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';

type LoginMethod = 'PHONE' | 'EMAIL';

export default function LoginPage() {
  const { requestOTP, verifyOTP, user } = useAuth();
  const router = useRouter();
  
  const [method, setMethod] = useState<LoginMethod>('PHONE');
  const [phone, setPhone] = useState('+336'); // Default prefix
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'ID' | 'OTP'>('ID');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedOTP, setGeneratedOTP] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.push('/');
  }, [user, router]);

  const identifier = method === 'PHONE' ? phone : email;

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await requestOTP(identifier);
    setLoading(false);

    if (res.success) {
      setStep('OTP');
      setGeneratedOTP(res.otp || null);
    } else {
      setError(res.error || "Erreur.");
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await verifyOTP(identifier, otp);
    setLoading(false);

    if (!res.success) setError(res.error || "Code invalide.");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-md w-full text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto mb-10 flex items-center justify-center font-black text-white text-3xl shadow-xl">SS</div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">SS Ges Imm</h1>
        <p className="text-slate-500 mb-8 font-medium text-sm">Accédez à votre espace sécurisé.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold">
            {error}
          </div>
        )}

        {step === 'ID' ? (
          <div className="space-y-6">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-2">
              <button onClick={() => setMethod('PHONE')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${method === 'PHONE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Téléphone</button>
              <button onClick={() => setMethod('EMAIL')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${method === 'EMAIL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Email</button>
            </div>

            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div className="text-left">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">{method === 'PHONE' ? 'Numéro WhatsApp' : 'Adresse Email'}</label>
                <input 
                    type={method === 'PHONE' ? "tel" : "email"}
                    value={method === 'PHONE' ? phone : email}
                    onChange={(e) => method === 'PHONE' ? setPhone(e.target.value) : setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-lg"
                />
              </div>
              <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition shadow-xl disabled:opacity-50">
                {loading ? 'Vérification...' : 'Recevoir le code'}
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="text-left">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Code de vérification (OTP)</label>
              <input type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-center text-3xl tracking-[0.5em]" />
            </div>
            {generatedOTP && <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl"><p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Code Test:</p><p className="text-2xl font-black text-blue-600 tracking-widest">{generatedOTP}</p></div>}
            <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition shadow-xl disabled:opacity-50">{loading ? 'Connexion...' : 'Valider'}</button>
          </form>
        )}
      </div>
    </div>
  );
}