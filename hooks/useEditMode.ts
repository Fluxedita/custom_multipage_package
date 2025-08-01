'use client';

import { useState } from "react";

export function useEditMode() {
  throw new Error("useEditMode is deprecated. Use useEditMode from hooks/EditModeContext instead.");
  const [isEditMode, setIsEditMode] = useState(false);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  return { isEditMode, toggleEditMode, setEditMode: setIsEditMode };
}