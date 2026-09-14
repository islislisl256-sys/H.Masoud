import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">???? ???????...</p>
    </div>
  );
}
