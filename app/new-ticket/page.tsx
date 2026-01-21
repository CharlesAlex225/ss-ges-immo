"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext"; // <--- 1. Import Auth

export default function NewTicketPage() {
  const router = useRouter();
  const { user } = useAuth(); // <--- 2. Get the logged-in user
  
  const [messages, setMessages] = useState([
    { role: "model", text: "Bonjour! Je suis l'assistant de maintenance. Quel problème rencontrez-vous ?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // 3. Send the message AND the User ID
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            message: input,
            userId: user?.id, // <--- Attaching the ID tag!
            userName: user?.name 
        }),
      });

      const data = await response.json();
      setMessages([...newMessages, { role: "model", text: data.text }]);
      
    } catch (error) {
      console.error("Error:", error);
      setMessages([...newMessages, { role: "model", text: "Désolé, une erreur de connexion est survenue." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 flex flex-col h-screen">
        <div className="mb-6 flex items-center gap-4">
            <Link href="/" className="p-2 bg-white rounded-full hover:bg-slate-100 border border-slate-200 transition">
                <ArrowLeft size={20} className="text-slate-600"/>
            </Link>
            <div>
                <h1 className="text-2xl font-black text-slate-900">Nouvelle Demande</h1>
                <p className="text-slate-500 text-sm">
                    {user ? `Connecté en tant que ${user.name}` : "Mode Invité"}
                </p>
            </div>
        </div>

        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] p-5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user" 
                        ? "bg-blue-600 text-white rounded-br-none" 
                        : "bg-slate-100 text-slate-800 rounded-bl-none"
                    }`}>
                    {msg.text}
                    </div>
                </div>
                ))}
                {isLoading && <div className="text-slate-400 text-xs ml-4 italic animate-pulse">Analyse en cours...</div>}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 bg-white border border-slate-200 text-slate-900 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        placeholder="Ex: Le radiateur du salon ne chauffe plus..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        disabled={isLoading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl transition-colors flex items-center justify-center shadow-lg shadow-blue-500/20"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}