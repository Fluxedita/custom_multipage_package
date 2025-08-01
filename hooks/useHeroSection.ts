import { useState, useEffect } from 'react';

interface HeroSectionData {
  backgroundImage: string;
  title: string;
  subtitle: string;
}

export function useHeroSection(initialData: HeroSectionData, storageKey: string) {
  const [heroData, setHeroData] = useState<HeroSectionData>(initialData);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          setHeroData(JSON.parse(savedData));
        } catch (error) {
          console.error('Error parsing saved hero data:', error);
        }
      }
    }
  }, [storageKey]);

  // Save data to localStorage whenever it changes
  const saveChanges = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(heroData));
      setIsDirty(false);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving hero data:', error);
    }
  };

  const updateHeroData = (updates: Partial<HeroSectionData>) => {
    setHeroData(prev => ({
      ...prev,
      ...updates
    }));
    setIsDirty(true);
  };

  const handleBackgroundImageChange = (url: string) => {
    updateHeroData({ backgroundImage: url });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateHeroData({ title: e.target.value });
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateHeroData({ subtitle: e.target.value });
  };

  return {
    heroData,
    isEditMode,
    isDirty,
    setIsEditMode,
    saveChanges,
    handleBackgroundImageChange,
    handleTitleChange,
    handleSubtitleChange,
    updateHeroData
  };
}
