'use client';

import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import useSpeechSynthesis from "@/hooks/useSpeechSynthesis";
import { useState } from "react";

interface ReadableSectionProps {
  title?: string;
  content: string | string[];
  className?: string;
}

export default function ReadableSection({ title, content, className = "" }: ReadableSectionProps) {
  const [isReading, setIsReading] = useState(false);
  const { speak, cancel, speaking, selectedVoice } = useSpeechSynthesis();

  const handleRead = () => {
    if (speaking) {
      cancel();
      setIsReading(false);
      return;
    }

    setIsReading(true);
    const textToRead = Array.isArray(content) ? content.join(' ') : content;
    const fullText = title ? `${title}. ${textToRead}` : textToRead;
    
    speak(fullText, { voice: selectedVoice || undefined });
  };

  return (
    <div className={`relative group ${className}`}>
      {title && <h2 className="text-3xl font-bold mb-4">{title}</h2>}
      <div className="relative">
        {Array.isArray(content) ? (
          content.map((paragraph, index) => (
            <p key={index} className="text-gray-600 mb-6">
              {paragraph}
            </p>
          ))
        ) : (
          <p className="text-gray-600 mb-6">{content}</p>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleRead}
        >
          <Volume2 className="h-4 w-4" />
          {isReading ? "Stop" : "Read"}
        </Button>
      </div>
    </div>
  );
} 