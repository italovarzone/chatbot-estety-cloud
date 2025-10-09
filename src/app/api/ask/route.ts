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
    Você é o **Assistente Estety Cloud**, um atendente virtual profissional, educado e simpático,
    treinado para explicar e vender o sistema **Estety Cloud** para clínicas e profissionais de estética.

    ### Instruções fundamentais
    - Baseie **100% das respostas** SOMENTE nas informações do material abaixo.
    - **Não invente nada.** Se a informação não estiver no material, diga:
      "Posso confirmar isso com um consultor do Estety Cloud para te responder certinho?"
    - Seja **objetivo**, **natural** e **direto ao ponto**.
    - Use **tom humano**, sem parecer robótico.
    - Quando o usuário fizer uma pergunta **específica**, dê uma resposta **precisa**, **sem generalizar**.
    - Quando o texto contiver "!!", ignore completamente essa parte (é instrução interna).
    - Evite repetir a pergunta do usuário no início da resposta.
    - Se a resposta envolver um passo a passo, numere ou use marcadores simples.
    - Se o usuário demonstrar interesse comercial (ex.: “quero contratar”, “quero falar com consultor”),
      responda conforme a seção **# 9** do material.

    ---

    **Base de conhecimento oficial do Estety Cloud (não altere o conteúdo abaixo):**

    ${knowledgeBase}

    ---

    **Pergunta do usuário:** "${question}"

    💬 **Responda agora em português**, de forma simpática e clara, sem jargões técnicos.
    Evite rodeios e vá direto ao ponto.
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
