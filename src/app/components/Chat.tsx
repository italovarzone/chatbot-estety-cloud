"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "bot"; text: string; typing?: boolean };

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "👋 Olá! Eu sou o **Assistente Estety Cloud**. Pode me perguntar qualquer coisa sobre o sistema 📚",
    },
  ]);
  const [input, setInput] = useState("");
  const [formData, setFormData] = useState({ nome: "", telefone: "", email: "" });
  const [awaitingData, setAwaitingData] = useState(false);
  const [botIsTyping, setBotIsTyping] = useState(false);
  const [dots, setDots] = useState(".");
  const [showIntro, setShowIntro] = useState(true); // controla o modal inicial

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // animação dos "... digitando"
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev === "..." ? "." : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // aplica máscara ao telefone
  const handlePhoneChange = (value: string) => {
    let numbers = value.replace(/\D/g, "");
    if (numbers.length > 11) numbers = numbers.slice(0, 11);

    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    }
  };

  const botReply = (finalText: string) => {
    setBotIsTyping(true);
    setMessages((prev) => [...prev, { role: "bot", text: "", typing: true }]);

    setTimeout(() => {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "bot", text: "" };
        return updated;
      });

      let i = 0;
      const interval = setInterval(() => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "bot",
            text: finalText.slice(0, i + 1),
          };
          return updated;
        });
        i++;
        if (i === finalText.length) {
          clearInterval(interval);
          setBotIsTyping(false);
        }
      }, 25);
    }, 2000);
  };

  const handleSend = async () => {
    if (!input.trim() && !awaitingData) return;

    // fluxo de captura de Nome/Telefone/Email
    if (awaitingData) {
      if (formData.nome && formData.telefone && formData.email) {
        try {
          const res = await fetch("/api/sendMail", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });

          if (res.ok) {
            botReply("✅ Seus dados foram enviados com sucesso! Em breve entraremos em contato.");
          } else {
            botReply("❌ Ocorreu um erro ao enviar seus dados. Tente novamente.");
          }
        } catch (err) {
          botReply("⚠️ Erro de conexão ao enviar os dados. Tente novamente.");
        }
        setAwaitingData(false);
        setFormData({ nome: "", telefone: "", email: "" });
      } else {
        botReply("⚠️ Por favor, preencha todos os campos antes de enviar.");
      }
      return;
    }

    // adiciona mensagem do usuário
    setMessages((prev) => [...prev, { role: "user", text: input }]);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      const data = await res.json();
      const reply = data.answer || "❌ Desculpe, não consegui encontrar uma resposta no momento.";

      // se a IA pedir dados do consultor
      if (reply.toLowerCase().includes("nome, telefone e email")) {
        setAwaitingData(true);
      }

      botReply(reply);
    } catch (err: unknown) {
      botReply("⚠️ Erro ao consultar a IA. Tente novamente em instantes.");
    }

    setInput("");
  };

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-[#fff] relative">
      {/* Header fixo */}
      <header className="bg-[#9d8983] text-white p-4 text-center shadow-md fixed top-0 left-0 right-0 z-10">
        <h1 className="font-bold text-lg">Assistente Estety Cloud</h1>
      </header>

      {/* Modal de introdução */}
      {showIntro && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 text-center">
            <h2 className="text-xl font-bold mb-4 text-[#9d8983]">
              Bem-vindo ao Assistente Estety Cloud 🤖
            </h2>
            <p className="text-gray-700 mb-4">
              Este é o seu assistente virtual!  
              Ele pode responder dúvidas sobre o sistema, explicar funcionalidades e até te guiar no uso do Estety Cloud.
            </p>
            <p className="text-gray-600 mb-6">
              Clique em <strong>Começar</strong> para iniciar o chat.
            </p>
            <button
              onClick={() => setShowIntro(false)}
              className="bg-[#9d8983] text-white px-4 py-2 rounded-lg hover:bg-[#bca49d] transition"
            >
              Começar
            </button>
          </div>
        </div>
      )}

      {/* Chat area com scroll */}
      <div
        className={`flex-1 overflow-y-auto p-4 space-y-3 pt-20 ${
          awaitingData ? "pb-64" : "pb-24"
        }`}
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] p-3 rounded-2xl shadow-md whitespace-pre-line ${
                m.role === "user"
                  ? "bg-[#9d8983] text-white rounded-br-none"
                  : "bg-[#bca49d] text-white rounded-bl-none"
              }`}
            >
              {m.typing ? dots : <ReactMarkdown>{m.text}</ReactMarkdown>}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input fixo */}
      <div className="p-3 border-t bg-white fixed bottom-0 left-0 right-0 z-10">
        {awaitingData ? (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Nome completo"
              className="w-full border border-[#bca49d] rounded-lg px-3 py-2
                         text-gray-900 placeholder-gray-500 focus:outline-none
                         focus:ring-2 focus:ring-[#9d8983] focus:border-[#9d8983]"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
            <input
              type="tel"
              placeholder="(99) 99999-9999"
              className="w-full border border-[#bca49d] rounded-lg px-3 py-2
                         text-gray-900 placeholder-gray-500 focus:outline-none
                         focus:ring-2 focus:ring-[#9d8983] focus:border-[#9d8983]"
              value={formData.telefone}
              onChange={(e) =>
                setFormData({ ...formData, telefone: handlePhoneChange(e.target.value) })
              }
              maxLength={15}
            />
            <input
              type="email"
              placeholder="exemplo@email.com"
              className="w-full border border-[#bca49d] rounded-lg px-3 py-2
                         text-gray-900 placeholder-gray-500 focus:outline-none
                         focus:ring-2 focus:ring-[#9d8983] focus:border-[#9d8983]"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <button
              onClick={handleSend}
              className="w-full bg-[#9d8983] text-white py-2 rounded-lg font-medium hover:bg-[#bca49d] transition"
            >
              Enviar
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              className="flex-1 border border-[#bca49d] rounded-l-lg px-3 py-2 text-[#1D1411]"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={botIsTyping}
            />
            <button
              onClick={handleSend}
              disabled={botIsTyping}
              className={`px-4 py-2 rounded-r-lg font-medium transition ${
                botIsTyping
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#9d8983] text-white hover:bg-[#bca49d]"
              }`}
            >
              ➤
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
