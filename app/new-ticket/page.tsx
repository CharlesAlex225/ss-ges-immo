"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";

export default function NewTicketPage() {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState([
    { role: "model", text: "Bonjour! Je suis l'assistant de maintenance. Quel est le problème ? (Ex: Fuite d'eau cuisine, Panne chauffage...)" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // 1. Update UI immediately
    const userMsg = { role: "user", text: input };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      // 2. Send the WHOLE history to the backend
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            history: newHistory, // <--- Sending the full conversation
            userId: user?.id,
            userName: user?.name 
        }),
      });

      const data = await response.json();
      
      // 3. Add AI response to the UI
      setMessages([...newHistory, { role: "model", text: data.text }]);
      
    } catch (error) {
      console.error("Error:", error);
      setMessages([...newHistory, { role: "model", text: "Oups, une erreur est survenue." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-4 md:p-8 flex flex-col h-screen">
        {/* Header */}
        <div className="mb-4 flex items-center gap-4 shrink-0">
            <Link href="/" className="p-2 bg-white rounded-full hover:bg-slate-100 border border-slate-200 transition">
                <ArrowLeft size={20} className="text-slate-600"/>
            </Link>
            <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900">Nouvelle Demande</h1>
                <p className="text-slate-500 text-xs md:text-sm">Assistant Intelligent</p>
            </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === "user" 
                        ? "bg-blue-600 text-white rounded-br-none" 
                        : "bg-slate-100 text-slate-800 rounded-bl-none"
                    }`}>
                    {msg.text}
                    </div>
                </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-50 text-slate-400 text-xs px-4 py-2 rounded-full italic animate-pulse border border-slate-100">
                            Analyse en cours...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
                <div className="flex gap-2 max-w-4xl mx-auto">
                    <input
                        type="text"
                        className="flex-1 bg-white border border-slate-200 text-slate-900 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm font-medium"
                        placeholder="Décrivez votre problème..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        disabled={isLoading}
                        autoFocus
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-6 rounded-xl transition-colors flex items-center justify-center shadow-lg disabled:opacity-50"
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