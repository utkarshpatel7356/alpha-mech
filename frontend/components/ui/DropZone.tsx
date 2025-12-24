import React, { useCallback } from 'react';
import { UploadCloud } from 'lucide-react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function DropZone({ onFileSelect, isProcessing }: DropZoneProps) {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300
        ${isProcessing 
          ? 'border-[#00ff9d] bg-green-900/10 animate-pulse' 
          : 'border-gray-700 hover:border-[#00ff9d] hover:bg-gray-800/50'}
      `}
    >
      <input 
        type="file" 
        className="hidden" 
        id="file-upload" 
        accept=".pdf"
        onChange={handleChange}
      />
      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
        <UploadCloud className={`w-12 h-12 ${isProcessing ? 'text-[#00ff9d]' : 'text-gray-400'}`} />
        <div>
          <p className="text-lg font-bold text-white">
            {isProcessing ? "ANALYZING NEURAL PATHWAYS..." : "UPLOAD RESEARCH PAPER"}
          </p>
          <p className="text-sm text-gray-500 mt-1">Drag & Drop PDF or Click to Browse</p>
        </div>
      </label>
    </div>
  );
}