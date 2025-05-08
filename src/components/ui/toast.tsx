"use client";

import React from 'react';
import { useToast } from './use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export function Toaster() {
  const { toasts, dismiss } = useToast();
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-xs">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`rounded-md px-4 py-3 shadow-lg ${
              toast.variant === 'success' 
                ? 'bg-[#66FCF1] text-[#0B0C10]' 
                : toast.variant === 'destructive'
                ? 'bg-red-500 text-white'
                : 'bg-[#1F2833] text-[#C5C8C7] border border-[#66FCF1]/30'
            }`}
            onClick={() => dismiss(toast.id)}
          >
            {toast.title && (
              <div className="font-medium">{toast.title}</div>
            )}
            {toast.description && (
              <div className="mt-1 text-sm opacity-90">{toast.description}</div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 