"use client";

import { useState } from 'react';
import { X } from 'lucide-react';

interface ErrorMessageProps {
  error: string | null;
  onDismiss?: () => void;
  className?: string;
}

export default function ErrorMessage({ error, onDismiss, className = "" }: ErrorMessageProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!error || !isVisible) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <div className={`bg-red-500/20 border border-red-300/30 rounded-lg px-4 py-3 mb-4 animate-fade-in ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-red-100 font-medium">Error</div>
          <div className="text-red-200 text-sm">{error}</div>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-3 text-red-300 hover:text-red-100 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
} 