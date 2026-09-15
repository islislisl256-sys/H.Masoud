import React from 'react';
import toast, { Toast } from 'react-hot-toast';
import { CheckCircle, AlertTriangle, Camera, PackagePlus, ShoppingBag, X } from 'lucide-react';

export const showProductToast = (title: string, message: string, type: 'add' | 'sale') => {
  toast.custom((t: Toast) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10 overflow-hidden`}
      style={{ direction: 'rtl' }}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            {type === 'add' ? (
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <PackagePlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            )}
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
      <div className="flex border-r border-gray-200 dark:border-gray-700">
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

export const showPermissionToast = () => {
  toast.custom((t: Toast) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 overflow-hidden`}
      style={{ direction: 'rtl' }}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mr-3 flex-1">
            <p className="text-sm font-bold text-white">
              إذن الوصول للكاميرا والصور
            </p>
            <p className="mt-1 text-sm text-amber-50 font-medium">
              يرجى منح المتصفح صلاحية الوصول للكاميرا لتتمكن من مسح الباركود بسهولة.
            </p>
            <div className="mt-3 flex gap-2">
               <button onClick={() => toast.dismiss(t.id)} className="bg-white text-orange-600 px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-orange-50 transition-colors">
                 حسناً، فهمت
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ), { duration: 10000, position: 'top-center' });
};