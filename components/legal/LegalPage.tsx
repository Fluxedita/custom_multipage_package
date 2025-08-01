'use client';

import Link from "next/link"
import { ArrowLeft, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReadTextButton from "@/components/ui/ReadTextButton"
import { useState } from "react"
import { cn } from "@/lib/utils"
import useSpeechSynthesis from "@/hooks/useSpeechSynthesis"

interface LegalPageProps {
  title: string
  content: {
    sections: {
      title: string
      content: string[]
    }[]
    lastUpdated: string
  }
}

export default function LegalPage({ title, content }: LegalPageProps) {
  const [isReadingAll, setIsReadingAll] = useState(false);
  const { speak, cancel, speaking, selectedVoice } = useSpeechSynthesis();

  const handleReadAll = () => {
    if (speaking) {
      cancel();
      setIsReadingAll(false);
      return;
    }

    setIsReadingAll(true);
    
    // Read title
    speak(`${title}.`, { voice: selectedVoice || undefined });
    
    // Read last updated
    setTimeout(() => {
      speak(`Last updated: ${content.lastUpdated}.`, { voice: selectedVoice || undefined });
    }, 2000);

    // Read each section
    content.sections.forEach((section, index) => {
      setTimeout(() => {
        speak(`${section.title}. ${section.content.join(' ')}`, { voice: selectedVoice || undefined });
      }, (index + 2) * 2000);
    });
  };

  const handleStopReading = () => {
    window.speechSynthesis.cancel();
    setIsReadingAll(false);
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{title}</h1>
              <p className="text-gray-500">Last Updated: {content.lastUpdated}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={isReadingAll ? handleStopReading : handleReadAll}
                variant={isReadingAll ? "destructive" : "default"}
                className={cn(
                  "transition-all duration-200",
                  isReadingAll && "animate-pulse"
                )}
              >
                {isReadingAll ? "Stop Reading" : "Read All"}
                {isReadingAll && (
                  <span className="animate-pulse">●</span>
                )}
              </Button>
              <ReadTextButton 
                text={`${title}. Last updated ${content.lastUpdated}. ${content.sections.map(section => 
                  `${section.title}. ${section.content.join(' ')}`
                ).join(' ')}`}
                tooltipText="Read entire document"
              />
            </div>
          </div>
        </div>

        <div className="prose max-w-none">
          {content.sections.map((section, index) => (
            <div key={index} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">{section.title}</h2>
                <ReadTextButton 
                  text={`${section.title}. ${section.content.join(' ')}`}
                  tooltipText={`Read ${section.title}`}
                />
              </div>
              {section.content.map((paragraph, pIndex) => (
                <p key={pIndex} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            If you have any questions about these {title}, please{" "}
            <Link href="/contact" className="text-blue-600 hover:underline">
              contact us
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
