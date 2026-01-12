import * as React from "react";
import { Snackbar, Alert } from "@mui/material";

type NotifyVariant = "success" | "error" | "info" | "warning";

type NotifyOptions = {
  duration?: number;
  anchorOrigin?: {
    vertical: "top";
    horizontal:  "right";
  };
};

type NotifyItem = {
  id: number;
  message: string;
  variant: NotifyVariant;
  duration: number;
  anchorOrigin: Required<NotifyOptions>["anchorOrigin"];
};

type NotificationContextValue = {
  notify: (message: string, variant?: NotifyVariant, options?: NotifyOptions) => void;
  notifySuccess: (message: string, options?: NotifyOptions) => void;
  notifyError: (message: string, options?: NotifyOptions) => void;
  notifyInfo: (message: string, options?: NotifyOptions) => void;
  notifyWarning: (message: string, options?: NotifyOptions) => void;
};

const NotificationContext = React.createContext<NotificationContextValue | null>(null);

const DEFAULT_DURATION = 3500;
const DEFAULT_ANCHOR = { vertical: "top" as const, horizontal: "right" as const };

let idCounter = 0;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const queueRef = React.useRef<NotifyItem[]>([]);
  const [current, setCurrent] = React.useState<NotifyItem | null>(null);
  const [open, setOpen] = React.useState(false);

  const showNext = React.useCallback(() => {
    const next = queueRef.current.shift();
    if (!next) return;
    setCurrent(next);
    setOpen(true);
  }, []);

  const enqueue = React.useCallback(
      (message: string, variant: NotifyVariant = "info", options?: NotifyOptions) => {
        queueRef.current.push({
          id: ++idCounter,
          message,
          variant,
          duration: options?.duration ?? DEFAULT_DURATION,
          anchorOrigin: options?.anchorOrigin ?? DEFAULT_ANCHOR,
        });

        if (!current && !open) {
          showNext();
        }
      },
      [current, open, showNext]
  );

  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const handleExited = () => {
    setCurrent(null);
    showNext();
  };

  const value = React.useMemo<NotificationContextValue>(
      () => ({
        notify: enqueue,
        notifySuccess: (msg, opt) => enqueue(msg, "success", opt),
        notifyError: (msg, opt) => enqueue(msg, "error", opt),
        notifyInfo: (msg, opt) => enqueue(msg, "info", opt),
        notifyWarning: (msg, opt) => enqueue(msg, "warning", opt),
      }),
      [enqueue]
  );

  return (
      <NotificationContext.Provider value={value}>
        {children}

        <Snackbar
            key={current?.id}
            open={open}
            autoHideDuration={current?.duration}
            onClose={handleClose}
            TransitionProps={{ onExited: handleExited }}
            anchorOrigin={current?.anchorOrigin}
        >
          <Alert
              onClose={handleClose}
              severity={current?.variant ?? "info"}
              variant="filled"
              sx={{ width: "100%" }}
          >
            {current?.message}
          </Alert>
        </Snackbar>
      </NotificationContext.Provider>
  );
}

export function useNotify() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotify must be used inside NotificationProvider");
  }
  return context;
}
