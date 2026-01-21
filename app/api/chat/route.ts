import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
  try {
    const { message, userId, userName } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. PROMPT UPDATE: Force French Language (Français)
    const prompt = `
      You are a property maintenance assistant. 
      The user (${userName || "Tenant"}) says: "${message}".
      
      Analyze this request and extract:
      1. A short title (max 5 words) - IN FRENCH
      2. A summary description - IN FRENCH
      3. Urgency level (LOW, MEDIUM, HIGH, or URGENT) - Keep these English keywords for the database
      4. Category (Plumbing, Electrical, Heating, General, etc.) - IN FRENCH
      
      Return ONLY a JSON object like this:
      { "title": "...", "description": "...", "urgency": "...", "category": "..." }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const ticketData = JSON.parse(cleanJson);

    console.log("🤖 AI Analysis:", ticketData);

    // 2. DATABASE SAVE
    const { data, error } = await supabase.from("tickets").insert({
      title: ticketData.title,
      description: ticketData.description,
      urgency: ticketData.urgency,
      category: ticketData.category,
      status: "open",
      user_id: userId || null 
    }).select(); // <--- Added .select() to confirm the save

    if (error) {
      // 3. LOUD ERROR LOGGING
      console.error("❌ SUPABASE SAVE FAILED:", error.message);
      console.error("❌ HINT: Check if 'user_id' is UUID vs Integer.");
    } else {
      console.log("✅ Ticket saved successfully:", data);
    }

    // Return the response (We translate the urgency label manually for the user)
    const urgencyMap: Record<string, string> = { 
        'LOW': 'FAIBLE', 'MEDIUM': 'MOYENNE', 'HIGH': 'ÉLEVÉE', 'URGENT': 'URGENTE' 
    };
    const frenchUrgency = urgencyMap[ticketData.urgency?.toUpperCase()] || ticketData.urgency;

    return NextResponse.json({ 
      text: `J'ai bien reçu votre demande concernant "${ticketData.title}". Elle a été classée comme priorité ${frenchUrgency} et transmise à l'équipe.` 
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}