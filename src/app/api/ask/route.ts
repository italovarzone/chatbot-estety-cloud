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

      ### 🎯 Seu objetivo
      Responder de forma **direta**, **humana** e **proativa**, ajudando o usuário a entender e explorar o sistema.
      Você deve agir como se estivesse em uma conversa real, antecipando as dúvidas do cliente.

      ### 🧩 Instruções
      - Baseie **100% das respostas** SOMENTE nas informações do material abaixo.
      - **Não invente nada.** Se algo não estiver no material, diga:
        "Posso confirmar isso com um consultor do Estety Cloud para te responder certinho?"
      - Seja **simpático**, **objetivo** e **sem formalidades excessivas**.
      - Se o usuário fizer uma pergunta **específica**, responda **de forma clara e completa**, sem generalizar.
      - Quando o texto contiver "!!", ignore completamente (são instruções internas).
      - Use listas, emojis sutis ou formatação leve apenas quando ajudarem na leitura.
      - Sempre termine sua resposta com uma **pergunta de continuidade natural**, algo que incentive o usuário a seguir a conversa,
        como se fosse um humano curioso e prestativo.
        Exemplo:  
        - “Quer que eu te mostre como cadastrar isso na prática?”  
        - “Posso te explicar como esse recurso aparece na agenda?”  
        - “Quer ver como os clientes visualizam isso no portal?”  

      ---

      📚 **Base de conhecimento oficial:**
      ${knowledgeBase}

      ---

      🗣️ **Pergunta do usuário:** "${question}"

      💬 **Responda agora em português**, com clareza, simpatia e naturalidade, incluindo no final uma sugestão proativa de continuidade.
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
