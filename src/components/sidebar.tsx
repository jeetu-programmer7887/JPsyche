"use client";

import * as React from "react";
import {
  Plus,
  MessageSquare,
  HelpCircle,
  PanelLeftCloseIcon,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chats: { id: string; title: string }[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onRenameChat: (id: string, newTitle: string) => Promise<void> | void; // Adjusted for async
  onDeleteChat: (id: string) => Promise<void> | void; // Adjusted for async
}

export function Sidebar({
  isOpen,
  onToggle,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onDeleteChat,
}: SidebarProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [processingId, setProcessingId] = React.useState<string | null>(null); // Track loading state
  const inputRef = React.useRef<HTMLInputElement>(null);

  const startEdit = (e: React.MouseEvent, chat: { id: string; title: string }) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
    setEditingId(chat.id);
    setEditValue(chat.title);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commitEdit = async () => {
    if (editingId && editValue.trim()) {
      setProcessingId(editingId);
      await onRenameChat(editingId, editValue.trim());
      setProcessingId(null);
    }
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const handleEditKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") cancelEdit();
  };

  const askDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setEditingId(null);
    setConfirmDeleteId(id);
  };

  const confirmDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setProcessingId(id);
    await onDeleteChat(id);
    setProcessingId(null);
    setConfirmDeleteId(null);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50
        md:relative
        h-full bg-surface-container-low border-r border-outline-variant/30
        flex flex-col overflow-hidden whitespace-nowrap
        transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isOpen
          ? "w-full md:w-[280px] translate-x-0"
          : "w-0 -translate-x-full md:translate-x-0 md:w-0"
        }
      `}
    >
      {/* Header */}
      <div className="p-4 flex flex-col gap-6">
        <div className="flex items-center justify-between px-2">
          <span className="text-xl font-bold text-primary tracking-tight">JPsyche</span>
          <button
            onClick={onToggle}
            className="p-2 cursor-pointer hover:bg-surface/50 rounded-full transition-colors text-on-surface-variant"
            aria-label="Close Sidebar"
          >
            <PanelLeftCloseIcon className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={onNewChat}
          className="flex items-center gap-3 cursor-pointer px-4 py-3 bg-primary text-on-primary rounded-xl hover:shadow-md hover:opacity-90 transition-all active:scale-[0.98]"
        >
          <Plus className="w-5 h-5 shrink-0" strokeWidth={2.5} />
          <span className="font-medium text-[15px]">New Chat</span>
        </button>
      </div>

      {/* Recent Section */}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-1 scrollbar-hide">
        <h3 className="px-4 py-2 text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider">
          Recent
        </h3>
        <div className="flex flex-col gap-1">
          {chats.map((chat) => {
            const isActive = activeChatId === chat.id;
            const isEditing = editingId === chat.id;
            const isConfirmingDelete = confirmDeleteId === chat.id;
            const isProcessing = processingId === chat.id;

            return (
              <div
                key={chat.id}
                onClick={() => !isEditing && !isProcessing && onSelectChat(chat.id)}
                className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${isActive
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-surface/60 text-on-surface-variant"
                  } ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {isProcessing ? (
                  <Loader2 className="w-[18px] h-[18px] shrink-0 animate-spin text-primary" />
                ) : (
                  <MessageSquare
                    className={`w-[18px] h-[18px] shrink-0 ${isActive ? "opacity-100" : "opacity-70"}`}
                  />
                )}

                {/* Inline rename input */}
                {isEditing ? (
                  <input
                    ref={inputRef}
                    value={editValue}
                    disabled={isProcessing}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleEditKey}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-transparent border-b border-primary outline-none text-[14px] text-on-surface min-w-0"
                  />
                ) : isConfirmingDelete ? (
                  <span className="flex-1 text-[13px] text-error font-medium truncate">
                    Delete this chat?
                  </span>
                ) : (
                  <span className="flex-1 text-[14px] truncate">{chat.title}</span>
                )}

                {/* Action buttons - Mobile optimized visibility */}
                <div
                  className={`flex items-center gap-0.5 shrink-0 transition-opacity ${isEditing || isConfirmingDelete || isActive
                    ? "opacity-100"
                    : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isProcessing ? (
                    <div className="w-8 h-3.5" /> // Spacer during loading
                  ) : isEditing ? (
                    <>
                      <button
                        onClick={commitEdit}
                        className="p-1 cursor-pointer rounded-md hover:bg-primary/20 text-primary transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 cursor-pointer rounded-md hover:bg-surface-container-high text-on-surface-variant transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : isConfirmingDelete ? (
                    <>
                      <button
                        onClick={(e) => confirmDelete(e, chat.id)}
                        className="p-1 cursor-pointer rounded-md hover:bg-error/20 text-error transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="p-1 cursor-pointer rounded-md hover:bg-surface-container-high text-on-surface-variant transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => startEdit(e, chat)}
                        className="p-1 cursor-pointer rounded-md hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => askDelete(e, chat.id)}
                        className="p-1 cursor-pointer rounded-md hover:bg-error/15 text-on-surface-variant hover:text-error transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom */}
      <div className="p-4 border-t border-outline-variant/20 flex flex-col gap-1">
        <button
          className="flex items-center gap-3 px-4 py-2.5 cursor-pointer rounded-xl hover:bg-surface/60 text-on-surface-variant transition-colors"
        >
          <HelpCircle className="w-[18px] h-[18px] shrink-0" />
          <Link href="/help" className="hover:text-primary font-semibold transition-colors">Help</Link>
        </button>
      </div>
    </aside>
  );
}