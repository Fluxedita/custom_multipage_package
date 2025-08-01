'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';
import useSpeechSynthesis from '@/hooks/useSpeechSynthesis';

export default function VoiceSelector() {
  const { voices, speak, cancel, speaking, selectedVoice } = useSpeechSynthesis();
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');

  useEffect(() => {
    // Load saved voice preference
    const savedVoice = localStorage.getItem('preferredVoice');
    if (savedVoice) {
      setSelectedVoiceName(savedVoice);
    }
  }, []);

  const handleVoiceSelect = (voiceName: string) => {
    setSelectedVoiceName(voiceName);
    // Test the selected voice
    const voice = voices.find(v => v.name === voiceName);
    if (voice) {
      speak("This is a test of the selected voice.", { voice });
    }
  };

  const handleSaveVoice = () => {
    if (selectedVoiceName) {
      localStorage.setItem('preferredVoice', selectedVoiceName);
      // Force a page reload to apply the new voice
      window.location.reload();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50 max-w-md">
      <h3 className="text-lg font-semibold mb-2">Select Voice</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {voices.map((voice) => (
          <div
            key={voice.name}
            className={`p-2 rounded cursor-pointer ${
              selectedVoiceName === voice.name
                ? 'bg-blue-100 dark:bg-blue-900'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => handleVoiceSelect(voice.name)}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm">{voice.name}</span>
              {selectedVoiceName === voice.name && (
                <span className="text-xs text-blue-600 dark:text-blue-400">Selected</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => cancel()}
          disabled={!speaking}
        >
          Stop Preview
        </Button>
        <Button
          onClick={handleSaveVoice}
          disabled={!selectedVoiceName}
        >
          Save Selection
        </Button>
      </div>
    </div>
  );
} 