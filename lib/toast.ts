"use client";

export interface ToastOptions {
  style?: {
    background?: string;
    color?: string;
  };
  duration?: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  options?: ToastOptions;
}

type Listener = (toasts: ToastMessage[]) => void;

let toasts: ToastMessage[] = [];
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener([...toasts]));
}

export function toast(message: string, options?: ToastOptions) {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const item: ToastMessage = { id, message, options };
  toasts = [...toasts, item];
  emit();

  const duration = options?.duration ?? 3500;
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, duration);
}

export function subscribeToasts(listener: Listener) {
  listeners.add(listener);
  listener([...toasts]);
  return () => {
    listeners.delete(listener);
  };
}
