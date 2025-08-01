

import { useState } from "react";
import { Edit, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditMode } from "@/hooks/EditModeContext";
import { useAuth } from "@/components/providers/AuthProvider";

interface CustomPageEditFabProps {
  onToggleEditAction: () => void;
}

export default function CustomPageEditFab({ onToggleEditAction }: CustomPageEditFabProps) {
  const { isAdmin } = useAuth();
  const { isEditMode } = useEditMode();
  const [open, setOpen] = useState(false);

  if (!isAdmin) return null;

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200" style={{ marginTop: '80px' }}>
      <Button
        variant={isEditMode ? "secondary" : "default"}
        size="icon"
        className="w-10 h-10 hover:bg-gray-100 transition-colors rounded-lg flex items-center justify-center"
        onClick={onToggleEditAction}
        aria-label={isEditMode ? "Exit Edit Mode" : "Edit Page"}
      >
        <Edit className="w-5 h-5" />
      </Button>
      {isEditMode && (
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 hover:bg-gray-100 transition-colors rounded-lg flex items-center justify-center"
          onClick={() => setOpen(true)}
          aria-label="Create New Page"
        >
          <PlusCircle className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
