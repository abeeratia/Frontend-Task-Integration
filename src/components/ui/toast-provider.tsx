"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { X, Check, AlertCircle, Info } from "lucide-react";

// --- Toast Context ---

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  visible: boolean;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// --- Provider ---

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 3000) => {
      // Generate a unique ID (stable for this call)
      const id = crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substr(2, 9);
      const newToast: Toast = { id, message, type, duration, visible: true };

      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <Toaster toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// --- Hook ---

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// --- Component ---

function Toaster({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => onRemove(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: () => void;
}) {
  const styles = {
    success:
      "bg-background border-green-500 text-green-600 dark:text-green-400",
    error: "bg-background border-red-500 text-red-600 dark:text-red-400",
    warning:
      "bg-background border-yellow-500 text-yellow-600 dark:text-yellow-400",
    info: "bg-background border-blue-500 text-blue-600 dark:text-blue-400",
  };

  const icons = {
    success: <Check className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };

  return (
    <div
      className={`
                pointer-events-auto flex items-center justify-between p-4 rounded-lg shadow-lg border 
                animate-in slide-in-from-bottom-5 fade-in duration-300
                bg-white dark:bg-zinc-950
                ${styles[toast.type]}
            `}
      role="alert"
    >
      <div className="flex items-center gap-3">
        {icons[toast.type]}
        <p className="text-sm font-medium text-foreground">{toast.message}</p>
      </div>
      <button
        onClick={onRemove}
        className="ml-4 p-1 rounded-md hover:bg-muted transition-colors"
      >
        <X className="h-4 w-4 opacity-50 hover:opacity-100" />
      </button>
    </div>
  );
}
