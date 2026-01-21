import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
  try {
    const { history, userId, userName } = await req.json();

    if (!history || history.length === 0) {
      return NextResponse.json({ error: "History is required" }, { status: 400 });
    }

    // Convert the frontend message list into a readable script for the AI
    const conversation = history.map((msg: any) => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
    ).join("\n");

    const prompt = `
      You are an advanced Property Manager Assistant. Your goal is to collect maintenance requests.
      
      Here is the conversation so far:
      ${conversation}

      INSTRUCTIONS:
      1. ANALYZE: Does the user provide enough detail to create a ticket? (Issue description AND Location/Context).
      2. DECISION:
         - IF VAGUE (e.g., "It's broken", "Leak"): Ask a polite clarifying question in French.
         - IF CLEAR (e.g., "Kitchen sink leaking on the floor"): Create the ticket.

      OUTPUT FORMAT:
      Return ONLY a JSON object. Do not write markdown.
      
      Structure:
      {
        "is_complete": boolean, // true if ticket should be created, false if we need more info
        "reply_to_user": "string", // The message to show the user (IN FRENCH)
        "ticket_data": { // Only fill this if is_complete is true
            "title": "Short title in French",
            "description": "Full summary in French",
            "urgency": "LOW/MEDIUM/HIGH/URGENT",
            "category": "Plumbing/Electrical/Heating/General"
        }
      }

      CRITICAL RULES:
      - If 'is_complete' is true, your 'reply_to_user' MUST confirm the ticket is created.
      - **PRIVACY RULE:** NEVER mention the Urgency/Priority level (Low/High/Urgent) in the 'reply_to_user'. Keep that internal.
      - Tone: Professional, empathetic, helpful.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    
    let aiResponse;
    try {
        aiResponse = JSON.parse(cleanJson);
    } catch (e) {
        console.error("JSON Parse Error", cleanJson);
        // Fallback if AI fails to output JSON
        return NextResponse.json({ text: "Je n'ai pas bien compris. Pouvez-vous reformuler ?" });
    }

    // LOGIC: To Save or Not to Save?
    if (aiResponse.is_complete && aiResponse.ticket_data) {
        // SAVE TO DB
        const { error } = await supabase.from("tickets").insert({
            title: aiResponse.ticket_data.title,
            description: aiResponse.ticket_data.description,
            urgency: aiResponse.ticket_data.urgency, // Saved for Admin
            category: aiResponse.ticket_data.category,
            status: "open",
            user_id: userId || null 
        });

        if (error) {
            console.error("DB Error:", error);
            return NextResponse.json({ text: "Désolé, une erreur technique a empêché la sauvegarde." });
        }
        
        console.log("✅ Ticket Saved:", aiResponse.ticket_data.title);
    }

    // Return the specific message the AI wrote (which hides the urgency)
    return NextResponse.json({ text: aiResponse.reply_to_user });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}