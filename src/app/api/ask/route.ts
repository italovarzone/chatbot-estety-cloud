import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

const knowledgePath = path.join(process.cwd(), "knowledge.txt");
let knowledgeBase = "";
if (fs.existsSync(knowledgePath)) {
  knowledgeBase = fs.readFileSync(knowledgePath, "utf-8");
}

export async function POST(req: Request) {
  try {
    const { question } = await req.json();
    if (!question) {
      return NextResponse.json({ answer: "Por favor, faça uma pergunta." }, { status: 400 });
    }

    // use modelo atualizado
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
Você é o Assistente Estety Cloud, um atendente simpático e profissional.
Baseie TODA a sua resposta apenas no seguinte material de estudo:

${knowledgeBase}

Pergunta do usuário: "${question}"

Responda em português, de forma clara e amigável.
    `;

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ answer: text });
  } catch (error) {
    console.error("Erro Gemini:", error);
    return NextResponse.json({ answer: "❌ Erro ao consultar a IA." }, { status: 500 });
  }
}
