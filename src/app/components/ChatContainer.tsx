"use client";
import { useState, useEffect } from "react";
import Chat, { Message } from "./Chat";
import ChatHistory, { ChatRecord } from "./ChatHistory";
import { Menu, X } from "lucide-react";

export default function ChatContainer() {
  const [chats, setChats] = useState<ChatRecord[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) setChats(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chats));
  }, [chats]);

  const handleNewChat = () => {
    const newChat: ChatRecord = {
      id: Date.now().toString(),
      title: "Nova conversa",
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setSidebarOpen(false);
  };

  const handleUpdateMessages = (id: string, messages: Message[]) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id ? { ...chat, messages } : chat
      )
    );
  };

  const handleDeleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) setActiveChatId(null);
  };

  const activeChat = chats.find((c) => c.id === activeChatId);

  return (
    <div className="relative h-[100dvh] w-full bg-[#f9f7f6] text-[#1D1411] overflow-hidden">
      {/* Topbar */}
      <div className="fixed top-0 left-0 w-full bg-[#9d8983] text-white flex items-center justify-between px-4 py-3 shadow-md z-40 md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center justify-center p-1 rounded-md hover:bg-[#bca49d]/20 transition"
        >
          <Menu size={24} />
        </button>
        <span className="font-semibold text-lg">Assistente Estety Cloud</span>
        <div className="w-6" />
      </div>

      {/* Sidebar flutuante */}
      <div
        className={`fixed inset-0 z-50 md:relative md:z-auto transform transition-transform duration-300 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:w-72 md:flex md:flex-col bg-white border-r border-gray-200 shadow-xl md:shadow-none`}
      >
        {/* Cabeçalho da sidebar */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-[#fdfcfc]">
          <h2 className="font-semibold text-[#9d8983] tracking-tight">
            Histórico
          </h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-[#9d8983] hover:text-[#bca49d] transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Conteúdo da sidebar */}
        <ChatHistory
          collapsed={false}
          chats={chats}
          activeId={activeChatId}
          onSelect={(id) => {
            setActiveChatId(id);
            setSidebarOpen(false);
          }}
          onNewChat={handleNewChat}
          onDelete={handleDeleteChat}
        />
      </div>

      {/* Overlay escurecido (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Conteúdo principal */}
      <div
        className={`h-full flex flex-col transition-all duration-300 ${
          sidebarOpen ? "pointer-events-none blur-sm md:blur-none" : ""
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
  );
}
