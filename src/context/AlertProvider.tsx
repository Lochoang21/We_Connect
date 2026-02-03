import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SnackbarOptions {
  message: string;
  severity?: "success" | "error" | "info" | "warning";
  autoHideDuration?: number;
}

interface SnackbarContextValue {
  openSnackbar: (options: SnackbarOptions) => void;
  showSnackbar: (
    severity: "success" | "error" | "info" | "warning",
    message: string,
    autoHideDuration?: number
  ) => void;
  closeSnackbar: () => void;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
  autoHideDuration: number;
}

const AlertContext = createContext<SnackbarContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSnackbar = (): SnackbarContextValue => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useSnackbar must be used within AlertProvider");
  }
  return context;
};

const severityConfig = {
  success: {
    icon: CheckCircle2,
    className:
      "border-green-500/50 text-green-700 bg-green-50 dark:border-green-500 dark:text-green-400 dark:bg-green-950/30",
  },
  error: {
    icon: XCircle,
    className:
      "border-red-500/50 text-red-700 bg-red-50 dark:border-red-500 dark:text-red-400 dark:bg-red-950/30",
  },
  warning: {
    icon: AlertCircle,
    className:
      "border-yellow-500/50 text-yellow-700 bg-yellow-50 dark:border-yellow-500 dark:text-yellow-400 dark:bg-yellow-950/30",
  },
  info: {
    icon: Info,
    className:
      "border-blue-500/50 text-blue-700 bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:bg-blue-950/30",
  },
};

interface AlertProviderProps {
  children: ReactNode;
}

const AlertProvider = ({ children }: AlertProviderProps) => {
  const [snackbarState, setSnackbarState] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
    autoHideDuration: 4000,
  });

  const openSnackbar = useCallback((options: SnackbarOptions) => {
    const { message, severity = "info", autoHideDuration } = options;
    if (!message) return;

    setSnackbarState({
      open: true,
      message,
      severity,
      autoHideDuration: autoHideDuration ?? 4000,
    });
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbarState((prev) => ({ ...prev, open: false }));
  }, []);

  // Helper function for simpler usage
  const showSnackbar = useCallback(
    (
      severity: "success" | "error" | "info" | "warning",
      message: string,
      autoHideDuration?: number
    ) => {
      openSnackbar({ severity, message, autoHideDuration });
    },
    [openSnackbar]
  );

  // Auto hide effect
  useState(() => {
    if (snackbarState.open && snackbarState.autoHideDuration > 0) {
      const timer = setTimeout(() => {
        closeSnackbar();
      }, snackbarState.autoHideDuration);

      return () => clearTimeout(timer);
    }
  });

  const Icon = severityConfig[snackbarState.severity].icon;

  return (
    <AlertContext.Provider value={{ openSnackbar, showSnackbar, closeSnackbar }}>
      {children}

      {/* Snackbar Container */}
      <div
        className={cn(
          "fixed bottom-6 left-6 z-50 transition-all duration-300 ease-in-out",
          snackbarState.open
            ? "translate-y-0 opacity-100"
            : "translate-y-2 opacity-0 pointer-events-none"
        )}
      >
        <Alert
          className={cn(
            "min-w-[300px] max-w-md shadow-lg",
            severityConfig[snackbarState.severity].className,
            "pr-8"
          )}
        >
          <Icon className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {snackbarState.message}
          </AlertDescription>
          <button
            onClick={closeSnackbar}
            className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </Alert>
      </div>
    </AlertContext.Provider>
  );
};

export default AlertProvider;
