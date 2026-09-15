import React, { useEffect, useRef } from 'react';
import { mainSupabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { showSystemToast, sendPushNotification } from './CustomToasts';

export default function ChatNotificationsManager() {
  const { currentUser, authData } = useAuth();
  const processedMessageIds = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    if (!currentUser || !authData?.user?.id) return;

    // Check for missed messages since last login (approximate based on last 5 minutes unread or similar, or just active subscription to new ones)
    // To not spam the user on login, we will only show notifications for NEW messages that arrive while the app is running.
    // If the user wants "offline" notifications, we can query recent messages that weren't seen. 
    // The user requested: "ادا لم يكن الحشاب مفتوح عندما يتم تسخيل الدخول به تاتيه تلك الاشعارات"
    
    let isMounted = true;
    
    const fetchMissedMessages = async () => {
      // Find the last login time from sessionStorage or localStorage
      const lastLogin = sessionStorage.getItem('login_time') || new Date(Date.now() - 1000 * 60 * 60).toISOString(); // Default to 1 hour ago
      if (!sessionStorage.getItem('login_time')) {
        sessionStorage.setItem('login_time', new Date().toISOString());
      }
      
      const { data, error } = await mainSupabase
        .from('workspace_messages')
        .select('id, content, sender_id, created_at, app_accounts(full_name)')
        .eq('workspace_id', currentUser.workspace_id)
        .neq('sender_id', currentUser.id)
        .gt('created_at', lastLogin)
        .order('created_at', { ascending: false });

      if (data && data.length > 0 && isMounted) {
        // Show a summary push notification instead of 50 individual ones
        const count = data.length;
        if (count === 1) {
           const msg = data[0];
           const senderName = msg.app_accounts?.full_name || 'زميل';
           sendPushNotification(`رسالة جديدة من ${senderName}`, { body: msg.content });
           showSystemToast(`رسالة جديدة من ${senderName}`, msg.content, 'chat'); // using db icon as a placeholder, maybe add chat icon
        } else {
           sendPushNotification(`لديك ${count} رسائل جديدة`, { body: `قمت بتلقي رسائل جديدة أثناء غيابك.` });
           showSystemToast(`رسائل جديدة`, `لديك ${count} رسائل غير مقروءة في المحادثة المشتركة.`, 'chat');
        }
        
        data.forEach(m => processedMessageIds.current.add(m.id));
      }
    };
    
    fetchMissedMessages();

    // Subscribe to real-time new messages
    const channel = mainSupabase.channel('public:workspace_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'workspace_messages',
        filter: `workspace_id=eq.${currentUser.workspace_id}`
      }, async (payload) => {
        const newMsg = payload.new;
        if (newMsg.sender_id !== currentUser.id && !processedMessageIds.current.has(newMsg.id)) {
          processedMessageIds.current.add(newMsg.id);
          
          // Fetch sender name
          const { data } = await mainSupabase.from('app_accounts').select('full_name').eq('id', newMsg.sender_id).single();
          const senderName = data?.full_name || 'زميل';
          
          sendPushNotification(`رسالة جديدة من ${senderName}`, { body: newMsg.content });
          showSystemToast(`رسالة جديدة من ${senderName}`, newMsg.content, 'chat');
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'workspace_messages',
        filter: `workspace_id=eq.${currentUser.workspace_id}`
      }, async (payload) => {
        const updatedMsg = payload.new;
        const oldMsg = payload.old;
        // Check for likes
        if (updatedMsg.sender_id === currentUser.id && updatedMsg.liked_by?.length > (oldMsg.liked_by?.length || 0)) {
           // Someone liked our message
           const likerId = updatedMsg.liked_by[updatedMsg.liked_by.length - 1];
           if (likerId !== currentUser.id) {
             const { data } = await mainSupabase.from('app_accounts').select('full_name').eq('id', likerId).single();
             const likerName = data?.full_name || 'أحد الزملاء';
             sendPushNotification(`تفاعل جديد`, { body: `قام ${likerName} بالإعجاب برسالتك` });
             showSystemToast(`تفاعل جديد`, `قام ${likerName} بالإعجاب برسالتك`, 'heart');
           }
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      mainSupabase.removeChannel(channel);
    };
  }, [currentUser, authData]);

  return null;
}