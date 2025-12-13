'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { renameResume } from '../actions/resume-crud';

interface RenameResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeId: string;
  currentName: string;
  onSuccess: (newName: string) => void;
}

export function RenameResumeDialog({
  open,
  onOpenChange,
  resumeId,
  currentName,
  onSuccess,
}: RenameResumeDialogProps) {
  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Resume name cannot be empty');
      return;
    }

    if (trimmedName === currentName) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    try {
      await renameResume(resumeId, trimmedName);
      toast.success('Resume renamed successfully');
      onSuccess(trimmedName);
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to rename resume';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename Resume</DialogTitle>
            <DialogDescription>
              Choose a unique name for your resume.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Resume Name</Label>
              <Input
                id='name'
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                placeholder='e.g., Software Engineer - Google'
                autoFocus
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
