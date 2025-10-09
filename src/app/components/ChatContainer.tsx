"use client";
import { useState, useEffect } from "react";
import Chat, { Message } from "./Chat";
import ChatHistory, { ChatRecord } from "./ChatHistory";
import { Menu, X } from "lucide-react";
import { openDB } from "idb";

export default function ChatContainer() {
  const [chats, setChats] = useState<ChatRecord[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Carrega histórico salvo
  useEffect(() => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) setChats(JSON.parse(saved));
  }, []);

  // Salva automaticamente o histórico
  useEffect(() => {
    const saveChats = async () => {
      const db = await openDB("ChatDB", 1, {
        upgrade(db) { db.createObjectStore("chats"); },
      });
      await db.put("chats", chats, "chatHistory");
    };
    saveChats();
  }, [chats]);

  // Cria nova conversa
  const handleNewChat = () => {
    const newChat: ChatRecord = {
      id: Date.now().toString(),
      title: "Nova conversa",
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setShowHistory(false);
  };

  // Atualiza mensagens
  const handleUpdateMessages = (id: string, messages: Message[]) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === id ? { ...chat, messages } : chat))
    );
  };

  // Exclui chat
  const handleDeleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) setActiveChatId(null);
  };

  const activeChat = chats.find((c) => c.id === activeChatId);

  return (
    <div className="flex items-center justify-center h-[100dvh] bg-[#f9f7f6]">
      {/* CONTAINER FIXO MOBILE */}
      <div
        className="
            relative 
            w-full h-full 
            bg-white 
            overflow-hidden 
            border border-gray-200 
            md:max-w-[420px] md:rounded-[30px] md:shadow-2xl 
            md:mx-auto
        "
        >
        {/* Cabeçalho fixo */}
        <div className="absolute top-0 left-0 right-0 bg-[#9d8983] text-white z-20 flex items-center justify-between px-4 py-3 shadow-md">
          {showHistory ? (
            <>
              <span className="font-semibold text-base">Histórico</span>
              <button
                onClick={() => setShowHistory(false)}
                className="text-white/90 hover:text-white"
              >
                <X size={22} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowHistory(true)}
                className="text-white/90 hover:text-white"
              >
                <Menu size={24} />
              </button>
              <span className="font-semibold text-lg">Assistente Estety Cloud</span>
              <div className="w-6" />
            </>
          )}
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="pt-[52px] h-full relative overflow-hidden">
          {/* HISTÓRICO (tela completa sobreposta) */}
          <div
            className={`absolute inset-0 bg-white z-10 transition-transform duration-300 ${
              showHistory ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <ChatHistory
              collapsed={false}
              chats={chats}
              activeId={activeChatId}
              onSelect={(id) => {
                setActiveChatId(id);
                setShowHistory(false);
              }}
              onNewChat={handleNewChat}
              onDelete={handleDeleteChat}
            />
          </div>

          {/* CHAT */}
          <div
            className={`absolute inset-0 transition-transform duration-300 ${
              showHistory ? "translate-x-full" : "translate-x-0"
            }`}
          >
            {activeChat ? (
              <Chat
                key={activeChat.id}
                chatId={activeChat.id}
                initialMessages={activeChat.messages}
                onMessagesChange={(msgs) =>
                  handleUpdateMessages(activeChat.id, msgs)
                }
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <h2 className="text-2xl font-semibold text-[#9d8983] mb-2">
                  Assistente Estety Cloud
                </h2>
                <p className="text-gray-600 mb-6">
                  Clique em <strong>“Nova conversa”</strong> para começar.
                </p>
                <button
                  onClick={handleNewChat}
                  className="bg-[#9d8983] text-white px-5 py-2 rounded-lg hover:bg-[#bca49d] transition"
                >
                  Nova conversa
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
