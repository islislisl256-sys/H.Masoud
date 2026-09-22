"use client";

import React, { useState, useEffect, useRef } from "react";
import { confirmDialog, showSystemToast } from "@/components/CustomToasts";
import { useAuth } from "@/contexts/AuthContext";
import { mainSupabase } from "@/lib/supabase";
import { Send, Edit2, Trash2, ArrowRight, Store, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

type Message = {
  id: string;
  workspace_id: string;
  sender_id: string;
  content: string;
  is_edited: boolean;
  liked_by: string[];
  created_at: string;
  app_accounts?: {
    full_name: string;
    role: string;
  };
};

export default function ChatPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Functions moved above useEffect to satisfy strict React immutability/hoisting rules ---

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    if (!currentUser) return;
    const { data, error } = await mainSupabase
      .from("workspace_messages")
      .select(`
        *,
        app_accounts:sender_id (full_name, role)
      `)
      .eq("workspace_id", currentUser.workspace_id)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data as unknown as Message[]);
    }
    setIsLoading(false);
  };

  // --- End of hoisted functions ---

  useEffect(() => {
    if (!currentUser) return;
    // eslint-disable-next-line\n    fetchMessages();

    const channel = mainSupabase
      .channel('workspace_messages_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workspace_messages',
          filter: `workspace_id=eq.${currentUser.workspace_id}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      mainSupabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const { error } = await mainSupabase.from("workspace_messages").insert([{
      workspace_id: currentUser.workspace_id,
      sender_id: currentUser.id,
      content: newMessage.trim(),
    }]);

    if (error) {
      toast.error("فشل إرسال الرسالة");
    } else {
      setNewMessage("");
    }
  };

  const handleUpdateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim() || !editingId || !currentUser) return;

    const { error } = await mainSupabase.from("workspace_messages")
      .update({ content: editContent.trim(), is_edited: true })
      .eq("id", editingId)
      .eq("sender_id", currentUser.id);

    if (error) {
      toast.error("فشل تعديل الرسالة");
    } else {
      setEditingId(null);
      setEditContent("");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (currentUser?.role !== 'LEADER') return;
    
    confirmDialog("مسح الرسالة", "هل أنت متأكد من مسح هذه الرسالة؟", async () => {
      const { error } = await mainSupabase.from("workspace_messages")
        .delete()
        .eq("id", id);
        
      if (error) {
        toast.error("فشل حذف الرسالة");
      }
    });
  };

  const handleDoubleClick = async (msg: Message) => {
    if (!currentUser) return;
    const hasLiked = msg.liked_by?.includes(currentUser.id);
    let newLikedBy = [...(msg.liked_by || [])];
    
    if (hasLiked) {
      newLikedBy = newLikedBy.filter(id => id !== currentUser.id);
    } else {
      newLikedBy.push(currentUser.id);
    }

    await mainSupabase.from("workspace_messages")
      .update({ liked_by: newLikedBy })
      .eq("id", msg.id);
  };

  if (!currentUser) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 relative">
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-[0.03] dark:opacity-5 overflow-hidden">
        <img src="/logo.png" alt="" className="w-[400px] h-[400px] object-contain grayscale" />
      </div>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-4 sm:px-6 z-10 shadow-sm shrink-0">
        <button 
          onClick={() => router.push('/settings')}
          className="flex items-center gap-1.5 p-2 ml-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          <span className="font-medium text-sm">رجوع للإعدادات</span>
        </button>
        <div className="flex items-center gap-3">
          {currentUser?.store_logo ? (
            <Image src={currentUser.store_logo} alt="Logo" width={40} height={40} className="rounded-full object-cover w-10 h-10 border border-gray-200" />
          ) : (
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
          )}
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white leading-tight text-lg">{currentUser?.store_name || "المتجر"}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">التواصل الداخلي لفريق العمل</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full text-gray-500">جاري التحميل...</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-gray-500 gap-2">
            <MessageSquare className="w-12 h-12 opacity-20" />
            <p>لا توجد رسائل بعد. كن أول من يرسل!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === currentUser.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2 shadow-sm group ${
                    isMine 
                      ? 'bg-primary text-white rounded-tl-none' 
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tr-none border border-gray-100 dark:border-gray-700'
                  }`}
                  onDoubleClick={() => handleDoubleClick(msg)}
                >
                  {!isMine && (
                    <div className="text-xs font-semibold text-primary mb-1">
                      {msg.app_accounts?.full_name || "مستخدم"}
                    </div>
                  )}

                  {editingId === msg.id ? (
                    <form onSubmit={handleUpdateMessage} className="flex flex-col gap-2 min-w-[200px]">
                      <input 
                        type="text" 
                        value={editContent} 
                        onChange={(e) => setEditContent(e.target.value)}
                        className="text-gray-900 rounded px-2 py-1 text-sm focus:outline-none"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setEditingId(null)} className="text-xs opacity-80 hover:opacity-100">إلغاء</button>
                        <button type="submit" className="text-xs font-bold bg-white/20 px-2 py-1 rounded hover:bg-white/30">حفظ</button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                  )}

                  <div className={`flex items-center gap-2 mt-1 text-[10px] ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                    <span>{new Date(msg.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                    {msg.is_edited && <span>(مُعدلة)</span>}
                  </div>

                  {msg.liked_by && msg.liked_by.length > 0 && (
                    <div className={`absolute -bottom-2 ${isMine ? '-left-2' : '-right-2'} bg-white dark:bg-gray-800 rounded-full shadow-md px-1.5 py-0.5 text-xs border border-gray-100 dark:border-gray-700 flex items-center gap-1 z-10`}>
                      👍 <span className="text-gray-600 dark:text-gray-300 font-medium">{msg.liked_by.length}</span>
                    </div>
                  )}

                  <div className={`absolute top-2 ${isMine ? '-left-16' : '-right-16'} opacity-0 group-hover:opacity-100 flex flex-col items-center gap-1 transition-opacity`}>
                    {isMine && !editingId && (
                      <button onClick={() => { setEditingId(msg.id); setEditContent(msg.content); }} className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:text-primary shadow-sm" title="تعديل">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {currentUser.role === 'LEADER' && (
                      <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:text-red-500 shadow-sm" title="حذف (صلاحية القائد)">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالة... (اضغط مرتين على أي رسالة للإعجاب)"
            className="flex-1 bg-gray-100 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-primary focus:ring-2 focus:ring-primary rounded-full px-5 py-3 pr-12 text-sm dark:text-white transition-colors"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="absolute left-1 top-1 bottom-1 bg-primary text-white p-2 w-10 h-10 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send className="w-4 h-4 rtl:-scale-x-100" />
          </button>
        </form>
      </div>
    </div>
  );
}
