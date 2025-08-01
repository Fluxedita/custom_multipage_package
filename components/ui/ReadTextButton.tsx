'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import useSpeechSynthesis from '@/hooks/useSpeechSynthesis';
import { Volume1, VolumeX } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ReadTextButtonProps {
  text: string;
  className?: string;
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  tooltipText?: string;
}

const ReadTextButton: React.FC<ReadTextButtonProps> = ({ 
  text, 
  className = "", 
  variant = "ghost", 
  size = "sm",
  tooltipText = "Read text aloud"
}) => {
  const { speak, cancel, speaking, supported } = useSpeechSynthesis();

  if (!supported || !text) {
    return null;
  }

  const handleClick = () => {
    if (speaking) {
      cancel();
    } else {
      speak(text);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            variant={variant}
            size={size}
            className={cn(
              "transition-all duration-200",
              speaking && "animate-pulse",
              className
            )}
            aria-label={speaking ? "Stop reading" : "Read text"}
          >
            {speaking ? (
              <VolumeX className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Volume1 className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{speaking ? "Stop reading" : tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ReadTextButton; 