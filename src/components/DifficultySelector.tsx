"use client";

import { motion } from "framer-motion";

interface DifficultySelectorProps {
  isEasyMode: boolean;
  onToggle: () => void;
  className?: string;
}

const DifficultySelector = ({ 
  isEasyMode, 
  onToggle,
  className = ""
}: DifficultySelectorProps) => {
  return (
    <motion.button
      onClick={onToggle}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
        isEasyMode
          ? "bg-[#66FCF1] text-[#0B0C10]"
          : "bg-[#1F2833] border border-[#66FCF1]/30 text-[#C5C8C7]"
      } ${className}`}
      aria-pressed={isEasyMode}
      aria-label="Toggle difficulty mode"
      tabIndex={0}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="relative flex h-3 w-3">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isEasyMode ? 'bg-[#0B0C10]' : 'bg-[#66FCF1]'}`}></span>
        <span className={`relative inline-flex rounded-full h-3 w-3 ${isEasyMode ? 'bg-[#0B0C10]' : 'bg-[#66FCF1]'}`}></span>
      </span>
      <span className="font-medium text-sm uppercase">
        {isEasyMode ? "Easy Mode" : "Normal Mode"}
      </span>
    </motion.button>
  );
};

export default DifficultySelector; 