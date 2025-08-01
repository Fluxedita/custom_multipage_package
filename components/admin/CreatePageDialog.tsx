"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import supabase from '@/lib/supabase/client';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface CreatePageDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
}

export function CreatePageDialog({ open, onOpenChangeAction }: CreatePageDialogProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"public" | "premium">("public");
  const [loading, setLoading] = useState(false);

  const slug = slugify(title);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setLoading(true);
    try {
      // Get the session using the auth helpers
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Error getting session:', sessionError);
        throw new Error('No active session');
      }

      // Get the current session's access token
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not found in session');
      }

      const res = await fetch("/api/pages/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ title, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create page");
      } else {
        toast.success("Page created successfully!");
        onOpenChangeAction(false);
        setTitle("");
        setType("public");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Page</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground mb-4">
          Create a new page with a title and type. The page will be accessible via a URL based on the title.
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Page Title</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter page title"
              required
              disabled={loading}
            />
            {title && (
              <div className="text-xs text-gray-500 mt-1">URL Slug: <span className="font-mono">/{slug}</span></div>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">Page Type</label>
            <RadioGroup value={type} onValueChange={v => setType(v as "public")}
              className="flex gap-4">
              <RadioGroupItem value="public" id="public" />
              <label htmlFor="public" className="mr-4">Public (Gallery layout)</label>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChangeAction(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Page"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
