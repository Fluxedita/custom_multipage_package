"use client";

import React, { useState } from "react";
import { Edit, PlusCircle } from "lucide-react";
import { CreatePageDialog } from "@/components/admin/CreatePageDialog";
import { useEditMode } from "@/hooks/EditModeContext";
import { useAuth } from "@/components/providers/AuthProvider";

interface ButtonStyles extends React.CSSProperties {
  '--button-bg'?: string;
  '--button-hover-bg'?: string;
  '--button-active-bg'?: string;
  '--button-text'?: string;
  '--button-border'?: string;
}

interface PageEditFabProps {
  onToggleEditAction?: () => void;
}

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function PageEditFab({ onToggleEditAction }: PageEditFabProps = {}) {
  const { isAdmin } = useAuth();
  const { isEditMode, toggleEditMode } = useEditMode();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const handleClick = onToggleEditAction || (() => {
    // Only update URL if not already in edit mode
    if (pathname?.startsWith("/custom_pages/") && !isEditMode) {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("edit", "true");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } else {
      toggleEditMode();
    }
  });
  const [open, setOpen] = useState(false);

  if (!isAdmin) return null;

  // Debug log
  console.log('Rendering PageEditFab', { isAdmin, isEditMode, open });

  // Container styles with TypeScript type
  const containerStyles: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    right: '1rem',
    transform: 'translateY(-50%)',
    zIndex: 2147483647, // Max z-index value
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(8px)',
    borderRadius: '1rem',
    padding: '1rem',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(209, 213, 219, 0.7)',
    // Debug styles
    outline: '2px solid #3b82f6',
    outlineOffset: '2px',
    visibility: 'visible',
    opacity: 1,
    pointerEvents: 'auto',
  };

  // Button styles with TypeScript type
  const buttonStyles: ButtonStyles = {
    width: '3rem',
    height: '3rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    '--button-bg': '#ffffff',
    '--button-hover-bg': '#f3f4f6',
    '--button-active-bg': '#e5e7eb',
    '--button-text': '#1f2937',
    '--button-border': '#e5e7eb',
  };

  return (
    <div style={containerStyles}>
      {/* Edit Mode Toggle Button */}
      <button
        type="button"
        style={buttonStyles}
        aria-label={isEditMode ? "Exit Edit Mode" : "Edit Page"}
        onClick={handleClick}
      >
        <Edit />
        {isEditMode && (
          <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400 rounded-full" />
        )}
      </button>
      {/* Only the Page Edit icon is visible. Add New Page button and dialog removed. */}
    </div>
  );
}
