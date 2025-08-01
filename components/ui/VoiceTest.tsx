'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import useSpeechSynthesis from '@/hooks/useSpeechSynthesis';

export default function VoiceTest() {
  const { voices, speak, speaking, cancel } = useSpeechSynthesis();
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (voices.length > 0) {
      // Try to find a female voice
      const femaleVoice = voices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('woman') ||
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('hazel')
      );
      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
      }
    }
  }, [voices]);

  const testVoice = (voice: SpeechSynthesisVoice) => {
    speak("Hello, this is a test of the voice synthesis system.", {
      voice,
      pitch: 1.1,
      rate: 0.9
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Available Voices</h2>
      <div className="space-y-2">
        {voices.map((voice, index) => (
          <div key={index} className="flex items-center gap-2 p-2 border rounded">
            <Button
              onClick={() => testVoice(voice)}
              variant="outline"
              size="sm"
              disabled={speaking}
            >
              Test Voice
            </Button>
            <span className="font-mono text-sm">
              {voice.name} ({voice.lang})
              {voice.default && ' (Default)'}
              {voice.localService && ' (Local)'}
            </span>
          </div>
        ))}
      </div>
      {speaking && (
        <Button onClick={cancel} variant="destructive" size="sm">
          Stop Speaking
        </Button>
      )}
      {selectedVoice && (
        <div className="mt-4 p-4 bg-green-50 rounded">
          <p className="font-semibold">Selected Voice:</p>
          <p className="font-mono text-sm">
            {selectedVoice.name} ({selectedVoice.lang})
          </p>
        </div>
      )}
    </div>
  );
} 