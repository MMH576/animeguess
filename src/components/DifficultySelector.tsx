"use client";

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
    <button
      onClick={onToggle}
      className={`group relative flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 overflow-hidden ${
        isEasyMode
          ? "bg-gradient-to-r from-[#8B11D1] to-[#b347fa] text-white shadow-lg border border-[#8B11D1]"
          : "bg-black/40 text-[#8B11D1] hover:bg-black/60 border border-[#8B11D1]/30"
      } ${className}`}
      aria-pressed={isEasyMode}
      aria-label="Toggle easy mode"
      tabIndex={0}
    >
      {/* Background pulse effect */}
      <div className={`absolute inset-0 bg-[#8B11D1]/20 rounded-xl transition-opacity duration-500 ${
        isEasyMode ? 'animate-pulse opacity-100' : 'opacity-0'
      }`} />
      
      {/* Toggle switch */}
      <div className="relative w-10 h-5 rounded-full flex items-center p-0.5 transition-colors duration-300 ease-in-out bg-black/20 shadow-inner border border-[#8B11D1]/30">
        <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
          isEasyMode 
            ? "translate-x-5 bg-white" 
            : "translate-x-0 bg-[#8B11D1]/70"
        }`} />
      </div>
      
      <div className="flex flex-col items-start relative z-10">
        <span className="font-bold tracking-wide text-sm">
          {isEasyMode ? "EASY MODE" : "NORMAL MODE"}
        </span>
        <span className="text-xs opacity-80">
          {isEasyMode 
            ? "Clear images" 
            : "Click for clearer images"}
        </span>
      </div>
    </button>
  );
};

export default DifficultySelector; 