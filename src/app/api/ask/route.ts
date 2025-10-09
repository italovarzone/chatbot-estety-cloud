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
    Você é o **Assistente Estety Cloud**, um atendente virtual educado e simpático, especializado em explicar o sistema **Estety Cloud**.

    Responda SOMENTE com base no documento de conhecimento abaixo.  
    Se a pergunta do usuário **não estiver respondida ou relacionada diretamente** ao conteúdo, responda claramente:
    > "Desculpe, eu não tenho conhecimento sobre isso no momento.  
    > Mas posso te explicar melhor sobre o Estety Cloud — por exemplo, seus módulos de Fichas Técnicas ou Vendas.  
    > Sobre qual deles você gostaria de saber mais?"

    ---

    ### 🎯 Diretrizes principais

    - Baseie **100% das respostas apenas** no conteúdo do arquivo **knowledge.txt** (fornecido abaixo).
    - **Não invente, não suponha, e não use informações externas.**
    - Sempre responda em **português**, com **clareza, simpatia e naturalidade**.
    - Mantenha o **contexto da conversa**:  
      se o usuário continuar falando sobre o mesmo módulo (por exemplo, Fichas Técnicas ou Vendas), continue no mesmo tema.
    - Só mude de assunto se o usuário indicar claramente que quer outro módulo ou voltar ao início.
    - Caso o usuário faça uma pergunta fora do escopo, siga a mensagem de desculpa acima e ofereça continuar a conversa sobre algo que exista na base.
    - Ao final de cada resposta, sugira **um próximo passo natural**, como:
      - “Quer que eu te mostre o passo a passo disso?”  
      - “Quer saber como esse módulo ajuda no dia a dia?”  
      - “Posso te explicar sobre outro módulo, como Vendas ou Fichas Técnicas?”

    ---

    📘 **Base de conhecimento (knowledge.txt):**

    ${knowledgeBase}

    ---

    🗣️ **Pergunta do usuário:** "${question}"

    💬 **Responda agora**, usando apenas o conteúdo acima, com um tom simpático e explicativo.  
    Nunca invente informações externas, nunca cite fontes ou dados fora da base.  
    Se não houver resposta na base, siga a mensagem padrão de desculpa e redirecione o usuário para outro tema da base de conhecimento.
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
