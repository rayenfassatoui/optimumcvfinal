'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  FileText,
  Edit,
  Trash2,
  MoreVertical,
  FileEdit,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { deleteResume } from '../actions/resume-crud';
import { CreateResumeDialog } from './create-resume-dialog';
import { RenameResumeDialog } from './rename-resume-dialog';

interface Resume {
  id: string;
  name: string;
  updatedAt: Date;
}

interface ResumeListProps {
  resumes: Resume[];
}

export function ResumeList({ resumes: initialResumes }: ResumeListProps) {
  const router = useRouter();
  const [resumes, setResumes] = useState(initialResumes);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renameResumeState, setRenameResumeState] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteResume(deleteId);
      setResumes(resumes.filter((r) => r.id !== deleteId));
      toast.success('Resume deleted');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete resume');
    } finally {
      setDeleteId(null);
    }
  };

  const handleRenameSuccess = (newName: string) => {
    if (!renameResumeState) return;
    setResumes(
      resumes.map((r) =>
        r.id === renameResumeState.id ? { ...r, name: newName } : r
      )
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>My Resumes</h2>
          <p className='text-muted-foreground'>Manage and edit your resumes.</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className='mr-2 h-4 w-4' />
          New Resume
        </Button>
      </div>

      {resumes.length === 0 ? (
        <Card className='border-dashed'>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <FileText className='h-12 w-12 text-muted-foreground mb-4' />
            <h3 className='text-lg font-medium mb-2'>No resumes yet</h3>
            <p className='text-muted-foreground text-center mb-4'>
              Create your first resume to get started.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className='mr-2 h-4 w-4' />
              Create Resume
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {resumes.map((resume) => (
            <Card
              key={resume.id}
              className='group hover:shadow-md transition-shadow'
            >
              <CardHeader className='flex flex-row items-start justify-between space-y-0'>
                <div className='space-y-1'>
                  <CardTitle className='text-lg'>{resume.name}</CardTitle>
                  <CardDescription>
                    Updated {formatDate(resume.updatedAt)}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon' className='h-8 w-8'>
                      <MoreVertical className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/dashboard/resume/${resume.id}`)
                      }
                    >
                      <Edit className='mr-2 h-4 w-4' />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setRenameResumeState({
                          id: resume.id,
                          name: resume.name,
                        })
                      }
                    >
                      <FileEdit className='mr-2 h-4 w-4' />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className='text-destructive'
                      onClick={() => setDeleteId(resume.id)}
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={() => router.push(`/dashboard/resume/${resume.id}`)}
                >
                  <Edit className='mr-2 h-4 w-4' />
                  Edit Resume
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resume?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              resume.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-destructive text-destructive-foreground'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateResumeDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {renameResumeState && (
        <RenameResumeDialog
          open={!!renameResumeState}
          onOpenChange={(open: boolean) => !open && setRenameResumeState(null)}
          resumeId={renameResumeState.id}
          currentName={renameResumeState.name}
          onSuccess={handleRenameSuccess}
        />
      )}
    </div>
  );
}
