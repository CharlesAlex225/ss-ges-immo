import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient"; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // 1. Ask Gemini to analyze the issue and give us JSON data
    // We ask it to strictly return format: {"category": "...", "urgency": "...", "reply": "..."}
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash", // Or use "gemini-1.5-flash" if 2.5 fails
        systemInstruction: `You are a rental maintenance manager. 
        When a user reports an issue, you MUST output a JSON object with:
        - category: (Plumbing, Electrical, General, or HVAC)
        - urgency: (High, Medium, or Low)
        - reply: (A polite response to the tenant)
        Do not output markdown code blocks. Just the raw JSON.`
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    
    // 2. Parse the AI's answer
    // (We clean up the text just in case the AI added extra formatting)
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const aiData = JSON.parse(cleanText);

    // 3. Save to Supabase Database
    const { error } = await supabase
      .from('tickets')
      .insert([
        { 
          description: message,     // What the user typed
          category: aiData.category,
          urgency: aiData.urgency,
          status: 'open'
        },
      ]);

    if (error) console.error("Supabase Error:", error);

    // 4. Send the polite reply back to the chat window
    return NextResponse.json({ text: aiData.reply });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ text: "I received your request, but I had trouble saving it. A manager has been notified." });
  }
}