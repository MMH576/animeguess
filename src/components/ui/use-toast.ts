"use client";

// Adapted from shadcn/ui toast component
import { useState, useEffect } from "react";

type ToastVariant = "default" | "success" | "destructive";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

type ToastListener = (toasts: Toast[]) => void;

const TOAST_TIMEOUT = 3000; // 3 seconds

// Create a simple toast store
let toasts: Toast[] = [];
let listeners: ToastListener[] = [];

// Helper to notify listeners when toasts change
const notifyListeners = () => {
  listeners.forEach(listener => listener(toasts));
};

// Add a new toast
export function toast({
  title,
  description,
  variant = "default",
  duration = TOAST_TIMEOUT
}: Omit<Toast, "id">) {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast = { id, title, description, variant, duration };
  
  toasts = [...toasts, newToast];
  notifyListeners();
  
  // Auto-dismiss toast after duration
  setTimeout(() => {
    dismissToast(id);
  }, duration);
  
  return id;
}

// Dismiss a toast by id
export function dismissToast(id: string) {
  toasts = toasts.filter(t => t.id !== id);
  notifyListeners();
}

// Hook to use toast in components
export function useToast() {
  const [toastList, setToastList] = useState<Toast[]>(toasts);
  
  useEffect(() => {
    // Add listener
    const handleToastsChange: ToastListener = (newToasts) => {
      setToastList([...newToasts]);
    };
    
    listeners.push(handleToastsChange);
    
    // Clean up listener on unmount
    return () => {
      listeners = listeners.filter(l => l !== handleToastsChange);
    };
  }, []);
  
  return {
    toast,
    dismiss: dismissToast,
    toasts: toastList
  };
} 