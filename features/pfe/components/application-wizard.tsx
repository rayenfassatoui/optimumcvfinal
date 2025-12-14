'use client';

import { useState, useEffect } from 'react';
import { generateApplicationContent } from '../actions/generate-application-content';
import { getResumes } from '@/features/resume/actions/get-resumes';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Send, CheckCircle, FileText, Sparkles } from 'lucide-react';
import { ResumePreview } from '@/features/resume/components/resume-preview';
import { toast } from 'sonner';
import { sendEmail } from '../actions/send-email';
import { pdf } from '@react-pdf/renderer';
import { HarvardTemplate } from '@/features/resume/components/harvard-template';
import { CoverLetterTemplate } from './cover-letter-template';

interface ApplicationWizardProps {
  topicId: string;
}

export function ApplicationWizard({ topicId }: ApplicationWizardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('resume');
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const data = await getResumes();
        setResumes(data);
        if (data.length > 0) {
          setSelectedResumeId(data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch resumes:', error);
        toast.error('Failed to load resumes');
      } finally {
        setIsLoadingResumes(false);
      }
    };
    fetchResumes();
  }, []);

  const generate = async () => {
    if (!selectedResumeId) {
      toast.error('Please select a resume first');
      return;
    }

    setIsLoading(true);
    try {
      const content = await generateApplicationContent(
        topicId,
        selectedResumeId
      );
      setGeneratedContent(content);
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate application');
    } finally {
      setIsLoading(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSend = async () => {
    if (!generatedContent.emailTo) {
      toast.error('Please enter a recipient email address');
      setActiveTab('email');
      return;
    }

    const toastId = toast.loading('Preparing application...');

    try {
      // Generate Resume PDF
      const resumeBlob = await pdf(
        <HarvardTemplate data={generatedContent.tailoredResume} />
      ).toBlob();
      const resumeBase64 = await blobToBase64(resumeBlob);

      // Generate Cover Letter PDF
      const coverLetterBlob = await pdf(
        <CoverLetterTemplate content={generatedContent.coverLetter} />
      ).toBlob();
      const coverLetterBase64 = await blobToBase64(coverLetterBlob);

      await sendEmail({
        to: generatedContent.emailTo,
        subject: generatedContent.emailSubject,
        body: generatedContent.emailBody,
        attachments: [
          {
            filename: 'Resume.pdf',
            content: resumeBase64.split(',')[1], // Remove data URL prefix
            contentType: 'application/pdf',
          },
          {
            filename: 'CoverLetter.pdf',
            content: coverLetterBase64.split(',')[1], // Remove data URL prefix
            contentType: 'application/pdf',
          },
        ],
      });

      toast.success('Application sent successfully!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to send email', { id: toastId });
    }
  };

  if (isLoadingResumes) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-[60vh] space-y-4'>
        <FileText className='w-12 h-12 text-muted-foreground' />
        <h3 className='text-xl font-semibold'>No Resumes Found</h3>
        <p className='text-muted-foreground text-center max-w-md'>
          You need to create at least one resume before you can apply to PFE
          topics.
        </p>
        <Button asChild>
          <a href='/dashboard/resume'>Create Resume</a>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center h-[60vh] space-y-4'>
        <Loader2 className='w-12 h-12 animate-spin text-primary' />
        <p className='text-lg font-medium text-muted-foreground'>
          Generating tailored application materials...
        </p>
        <p className='text-sm text-muted-foreground'>
          Creating custom resume, cover letter, and email.
        </p>
      </div>
    );
  }

  if (!generatedContent) {
    return (
      <div className='max-w-2xl mx-auto py-12 space-y-8'>
        <div className='text-center space-y-2'>
          <h2 className='text-2xl font-bold'>Customize Your Application</h2>
          <p className='text-muted-foreground'>
            Select a base resume to tailor for this specific internship topic.
          </p>
        </div>

        <div className='space-y-4'>
          <Label>Select Base Resume</Label>
          <div className='grid gap-4 md:grid-cols-2'>
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className={`
                                    cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary
                                    ${
                                      selectedResumeId === resume.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted'
                                    }
                                `}
                onClick={() => setSelectedResumeId(resume.id)}
              >
                <div className='flex items-start justify-between'>
                  <div className='space-y-1'>
                    <p className='font-semibold'>{resume.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      Updated {new Date(resume.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedResumeId === resume.id && (
                    <CheckCircle className='w-5 h-5 text-primary' />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button size='lg' className='w-full' onClick={generate}>
          <Sparkles className='w-4 h-4 mr-2' />
          Generate Application
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-6 h-full flex flex-col'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Review Application</h2>
          <Button
            variant='link'
            className='p-0 h-auto text-muted-foreground text-sm'
            onClick={() => setGeneratedContent(null)}
          >
            ← Back to selection
          </Button>
        </div>
        <Button onClick={handleSend} className='gap-2'>
          <Send className='w-4 h-4' />
          Send Application
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='flex-1 flex flex-col'
      >
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='resume'>Tailored Resume</TabsTrigger>
          <TabsTrigger value='cover-letter'>Cover Letter</TabsTrigger>
          <TabsTrigger value='email'>Email</TabsTrigger>
        </TabsList>

        <div className='flex-1 mt-4 border rounded-lg p-4 bg-background overflow-hidden'>
          <TabsContent value='resume' className='h-full mt-0'>
            <div className='h-full overflow-hidden'>
              <ResumePreview data={generatedContent.tailoredResume} />
            </div>
          </TabsContent>

          <TabsContent
            value='cover-letter'
            className='h-full mt-0 overflow-y-auto'
          >
            <div className='space-y-2 h-full'>
              <Label>Cover Letter Content (Markdown)</Label>
              <Textarea
                className='h-full font-mono text-sm resize-none'
                value={generatedContent.coverLetter}
                onChange={(e) =>
                  setGeneratedContent({
                    ...generatedContent,
                    coverLetter: e.target.value,
                  })
                }
              />
            </div>
          </TabsContent>

          <TabsContent value='email' className='h-full mt-0'>
            <div className='space-y-4 h-full flex flex-col'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>To</Label>
                  <Input
                    placeholder='recruiter@company.com'
                    value={generatedContent.emailTo || ''}
                    onChange={(e) =>
                      setGeneratedContent({
                        ...generatedContent,
                        emailTo: e.target.value,
                      })
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Subject</Label>
                  <Input
                    value={generatedContent.emailSubject}
                    onChange={(e) =>
                      setGeneratedContent({
                        ...generatedContent,
                        emailSubject: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className='space-y-2 flex-1 flex flex-col'>
                <Label>Body</Label>
                <Textarea
                  className='flex-1 resize-none'
                  value={generatedContent.emailBody}
                  onChange={(e) =>
                    setGeneratedContent({
                      ...generatedContent,
                      emailBody: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
