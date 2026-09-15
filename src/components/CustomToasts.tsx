import React, { useEffect, useState } from 'react';
import toast, { Toast } from 'react-hot-toast';
import { CheckCircle, Camera, PackagePlus, ShoppingBag, X, UserCog, FileText, Database, Bell, MessageSquare, Heart, Trash2, AlertTriangle, XCircle } from 'lucide-react';

export const showSystemToast = (title: string, message: string, type: 'add' | 'sale' | 'edit_user' | 'invoice' | 'db' | 'chat' | 'heart' | 'delete' | 'warning' | 'error') => {
  const getIcon = () => {
    switch(type) {
      case 'add': return <PackagePlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
      case 'sale': return <ShoppingBag className="h-6 w-6 text-green-600 dark:text-green-400" />;
      case 'edit_user': return <UserCog className="h-6 w-6 text-purple-600 dark:text-purple-400" />;
      case 'invoice': return <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />;
            case 'db': return <Database className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />;
      case 'chat': return <MessageSquare className="h-6 w-6 text-pink-600 dark:text-pink-400" />;
            case 'heart': return <Heart className="h-6 w-6 text-red-600 dark:text-red-400 fill-current" />;
      case 'delete': return <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />;
      case 'warning': return <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />;
      case 'error': return <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />;
    }
  };

  const getBg = () => {
    switch(type) {
      case 'add': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'sale': return 'bg-green-100 dark:bg-green-900/30';
      case 'edit_user': return 'bg-purple-100 dark:bg-purple-900/30';
      case 'invoice': return 'bg-indigo-100 dark:bg-indigo-900/30';
            case 'db': return 'bg-cyan-100 dark:bg-cyan-900/30';
      case 'chat': return 'bg-pink-100 dark:bg-pink-900/30';
            case 'heart': return 'bg-red-100 dark:bg-red-900/30';
      case 'delete': return 'bg-red-100 dark:bg-red-900/30';
      case 'warning': return 'bg-amber-100 dark:bg-amber-900/30';
      case 'error': return 'bg-red-100 dark:bg-red-900/30';
    }
  };

  toast.custom((t: Toast) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white dark:bg-gray-900 shadow-[0_0_20px_rgba(59,130,246,0.3)] rounded-2xl pointer-events-auto flex ring-1 ring-blue-500/20 overflow-hidden border border-blue-100 dark:border-blue-800/50`}
      style={{ direction: 'rtl' }}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getBg()}`}>
              {getIcon()}
            </div>
          </div>
          <div className="mr-3 flex-1">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {title}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-r border-gray-100 dark:border-gray-800">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-l-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  ), { duration: 4000, position: 'top-center' });
};

// OS Level Push Notification Wrapper
export const sendPushNotification = (title: string, options?: NotificationOptions) => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      ...options
    });
  }
};

export const showPermissionToast = () => {
  toast.custom((t: Toast) => {
    const handleGrantNotifications = async () => {
      if ("Notification" in window) {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          toast.success("تم تفعيل إشعارات الرسائل!");
          toast.dismiss(t.id);
        } else {
          toast.error("تم رفض الصلاحية. يرجى تفعيلها من إعدادات المتصفح.");
        }
      }
    };

    const handleGrantCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Stop immediately, we just needed permission
        toast.success("تم تفعيل الكاميرا بنجاح!");
      } catch (err) {
        toast.error("تم رفض الكاميرا أو لا توجد كاميرا متصلة.");
      }
    };

    return (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_10px_40px_rgba(245,158,11,0.5)] rounded-2xl pointer-events-auto flex ring-1 ring-black/5 overflow-hidden border border-orange-400`}
        style={{ direction: 'rtl' }}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                <Bell className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mr-3 flex-1">
              <p className="text-sm font-bold text-white">
                أذونات النظام المطلوبة
              </p>
              <p className="mt-1 text-xs text-amber-50 font-medium">
                يرجى منح المتصفح الصلاحيات اللازمة لوصول إشعارات المحادثات (حتى خارج التطبيق) واستخدام الكاميرا.
              </p>
              <div className="mt-3 flex gap-2 flex-wrap">
                 <button onClick={handleGrantNotifications} className="bg-white text-orange-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-orange-50 transition-colors">
                   تفعيل الإشعارات
                 </button>
                 <button onClick={handleGrantCamera} className="bg-white/20 border border-white/40 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-white/30 transition-colors">
                   تجربة الكاميرا
                 </button>
                 <button onClick={() => toast.dismiss(t.id)} className="bg-transparent text-amber-100 px-2 py-1.5 rounded-lg text-xs hover:text-white transition-colors">
                   لاحقاً
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, { duration: Infinity, position: 'top-center', id: 'permission-toast' });
};

export const confirmDialog = (title: string, message: string, onConfirm: () => void) => {
  toast.custom((t: Toast) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-sm w-full bg-white dark:bg-gray-800 shadow-2xl rounded-2xl pointer-events-auto flex flex-col ring-1 ring-black/5 dark:ring-white/10 p-5`}
      style={{ direction: 'rtl' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 mr-13">
        {message}
      </p>
      <div className="flex gap-3 mt-auto">
        <button
          onClick={() => {
            toast.dismiss(t.id);
            onConfirm();
          }}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
        >
          نعم، تأكيد
        </button>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
        >
          إلغاء
        </button>
      </div>
    </div>
  ), { duration: Infinity, position: 'top-center', id: 'confirm-dialog' });
};
