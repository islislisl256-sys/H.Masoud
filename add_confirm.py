import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/components/CustomToasts.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

confirm_fn = """
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
"""

if 'confirmDialog' not in content:
    content = content + '\n' + confirm_fn

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added confirmDialog to CustomToasts")