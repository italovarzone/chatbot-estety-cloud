"use client";
import { useState } from "react";
import { Trash2, PlusCircle, MessageSquare, Edit3 } from "lucide-react";
import { Message } from "./Chat";

export type ChatRecord = {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
};

type Props = {
  collapsed: boolean;
  chats: ChatRecord[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  onToggleCollapse?: () => void;
};

export default function ChatHistory({
  collapsed,
  chats,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  onToggleCollapse,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const handleRename = (id: string) => {
    const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
    const chat = history.find((c: ChatRecord) => c.id === id);
    if (chat) {
      chat.title = (newTitle || "Nova conversa").trim();
      localStorage.setItem("chatHistory", JSON.stringify(history));
    }
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-[calc(100%-48px)] overflow-hidden">
      {/* Barra “Nova conversa” */}
      <div className={`border-b border-gray-100 ${collapsed ? "px-2 py-2" : "px-3 py-3"}`}>
        <button
          onClick={onNewChat}
          className={`w-full flex items-center ${collapsed ? "justify-center" : "justify-start"} gap-2 text-[#9d8983] hover:text-[#bca49d] transition`}
          title="Nova conversa"
        >
          <PlusCircle size={20} />
          {!collapsed && <span className="font-medium text-sm">Nova conversa</span>}
        </button>
      </div>

      {/* Lista de conversas (com scroll) */}
      <div className="flex-1 overflow-y-auto px-1 sm:px-2 py-2 space-y-1">
        {chats.length === 0 ? (
          !collapsed && <p className="text-center text-gray-400 mt-6 text-base">Nenhum chat salvo</p>
        ) : (
          chats.map((chat) => {
            const isActive = chat.id === activeId;
            return (
              <div
                key={chat.id}
                className={[
                  "group relative flex items-center",
                  collapsed ? "justify-center px-1 py-3" : "justify-between p-3",
                  "rounded-lg cursor-pointer transition",
                  isActive ? "bg-[#ede5e3] shadow-sm" : "hover:bg-[#f7f2f1]",
                ].join(" ")}
                onClick={() => onSelect(chat.id)}
                onDoubleClick={() => {
                  if (collapsed && onToggleCollapse) onToggleCollapse();
                  else { setEditingId(chat.id); setNewTitle(chat.title); }
                }}
                onTouchStart={(e) => {
                  // toque longo (700ms) => renomear
                  const t = setTimeout(() => {
                    if (collapsed && onToggleCollapse) onToggleCollapse();
                    else { setEditingId(chat.id); setNewTitle(chat.title); }
                  }, 700);
                  const clear = () => clearTimeout(t);
                  e.currentTarget.addEventListener("touchend", clear, { once: true });
                  e.currentTarget.addEventListener("touchmove", clear, { once: true });
                }}
                title={collapsed ? (chat.title || "Nova conversa") : undefined}
              >
                {/* Ícone + título/edição */}
                <div className={`flex items-center gap-2 ${collapsed ? "" : "flex-1 min-w-0"}`}>
                  <MessageSquare size={20} className="text-[#9d8983] shrink-0" />
                  {!collapsed && (
                    editingId === chat.id ? (
                      <input
                        autoFocus
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onBlur={() => handleRename(chat.id)}
                        onKeyDown={(e) => e.key === "Enter" && handleRename(chat.id)}
                        className="w-full bg-white border border-[#bca49d] rounded-md px-2 py-1 text-[15px] outline-none"
                      />
                    ) : (
                      <span className="truncate text-[15px] font-medium text-gray-800">
                        {chat.title || "Nova conversa"}
                      </span>
                    )
                  )}
                </div>

                {/* Ações (desktop expandido) */}
                {!collapsed && (
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(chat.id);
                        setNewTitle(chat.title);
                      }}
                      className="text-gray-400 hover:text-[#9d8983] transition"
                      title="Renomear"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(chat.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
