'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechOptions {
  voice?: SpeechSynthesisVoice;
  pitch?: number; // 0 to 2
  rate?: number; // 0.1 to 10
  volume?: number; // 0 to 1
}

interface SpeechSynthesisHook {
  speak: (text: string, options?: SpeechOptions) => void;
  cancel: () => void;
  speaking: boolean;
  supported: boolean;
  voices: SpeechSynthesisVoice[];
  error: SpeechSynthesisErrorEvent | null;
  selectedVoice: SpeechSynthesisVoice | null;
}

const useSpeechSynthesis = (): SpeechSynthesisHook => {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [error, setError] = useState<SpeechSynthesisErrorEvent | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
      synthRef.current = window.speechSynthesis;

      const getVoices = () => {
        const availableVoices = synthRef.current?.getVoices() || [];
        setVoices(availableVoices);

        // Wait for voices to be loaded
        if (availableVoices.length === 0) {
          setTimeout(getVoices, 100);
          return;
        }

        // Try to load saved voice preference
        const savedVoiceName = localStorage.getItem('preferredVoice');
        if (savedVoiceName) {
          const savedVoice = availableVoices.find(v => v.name === savedVoiceName);
          if (savedVoice) {
            setSelectedVoice(savedVoice);
            return;
          }
        }

        // If no saved preference, try to find an Irish English Female voice
        const irishFemale = availableVoices.find(v => 
          v.lang === 'en-IE' && (
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('woman') ||
            v.name.toLowerCase().includes('moira') // Apple's "Moira" is Irish
          )
        );
        if (irishFemale) {
          setSelectedVoice(irishFemale);
          localStorage.setItem('preferredVoice', irishFemale.name);
          return;
        }

        // Fallback to Google UK English Female (en-GB)
        const googleUKFemale = availableVoices.find(v => 
          v.name === 'Google UK English Female' && 
          v.lang === 'en-GB'
        );
        if (googleUKFemale) {
          setSelectedVoice(googleUKFemale);
          localStorage.setItem('preferredVoice', googleUKFemale.name);
          return;
        }

        // Fallback to any female English voice
        const femaleEnglish = availableVoices.find(v => 
          v.lang.startsWith('en') && (
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('woman')
          )
        );
        if (femaleEnglish) {
          setSelectedVoice(femaleEnglish);
          localStorage.setItem('preferredVoice', femaleEnglish.name);
          return;
        }
      };

      // Voices might not be immediately available
      synthRef.current.onvoiceschanged = getVoices;
      getVoices(); // Call initially in case voices are already loaded

      return () => {
        if (synthRef.current) {
          synthRef.current.cancel();
          synthRef.current.onvoiceschanged = null;
        }
      };
    } else {
      setSupported(false);
    }
  }, []);

  const speak = useCallback((text: string, options?: SpeechOptions) => {
    if (!supported || !synthRef.current) {
      console.warn('Speech synthesis not supported or not initialized.');
      return;
    }

    if (synthRef.current.speaking) {
      synthRef.current.cancel(); // Stop current speech before starting new one
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Use the provided voice or the selected voice
    if (options?.voice) {
      utterance.voice = options.voice;
    } else if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Use natural settings
    utterance.pitch = options?.pitch ?? 1.2;
    utterance.rate = options?.rate ?? 1.0;
    utterance.volume = options?.volume ?? 1;

    utterance.onstart = () => {
      setSpeaking(true);
      setError(null);
    };

    utterance.onend = () => {
      setSpeaking(false);
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      console.error('Speech synthesis error:', event);
      setError(event);
      setSpeaking(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [supported, selectedVoice]);

  const cancel = useCallback(() => {
    if (supported && synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      setSpeaking(false);
    }
  }, [supported]);

  return {
    speak,
    cancel,
    speaking,
    supported,
    voices,
    error,
    selectedVoice,
  };
};

export default useSpeechSynthesis; 