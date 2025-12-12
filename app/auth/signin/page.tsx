'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { SignInPage, type Testimonial } from '@/components/ui/sign-in';
import { authClient } from '@/lib/auth-client';

const sampleTestimonials: Testimonial[] = [
    {
        avatarSrc: 'https://randomuser.me/api/portraits/women/57.jpg',
        name: 'Sarah Chen',
        handle: '@sarahdigital',
        text: 'Amazing platform! The user experience is seamless and the features are exactly what I needed.',
    },
    {
        avatarSrc: 'https://randomuser.me/api/portraits/men/64.jpg',
        name: 'Marcus Johnson',
        handle: '@marcustech',
        text: 'This service has transformed how I work. Clean design, powerful features, and excellent support.',
    },
    {
        avatarSrc: 'https://randomuser.me/api/portraits/men/32.jpg',
        name: 'David Martinez',
        handle: '@davidcreates',
        text: "I've tried many platforms, but this one stands out. Intuitive, reliable, and genuinely helpful for productivity.",
    },
];

export default function SignIn() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await authClient.signIn.email(
                {
                    email,
                    password,
                },
                {
                    onRequest: () => {
                        setLoading(true);
                    },
                    onSuccess: () => {
                        toast.success('Signed in successfully');
                        router.push('/dashboard');
                    },
                    onError: (ctx) => {
                        toast.error(ctx.error.message);
                        setLoading(false);
                    },
                },
            );
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
            setLoading(false);
        }
    };

    const handleAtlassianSignIn = async () => {
        setLoading(true);
        try {
            await authClient.signIn.social({
                provider: 'atlassian',
                callbackURL: '/dashboard',
            });
        } catch (error) {
            console.error('Atlassian sign-in error:', error);
            toast.error('Failed to sign in with Atlassian');
            setLoading(false);
        }
    };

    const handleResetPassword = () => {
        toast.info('Password reset coming soon!');
    };

    const handleCreateAccount = () => {
        router.push('/auth/signup');
    };

    const handleGoBack = () => {
        router.push('/');
    };

    return (
        <SignInPage
            title={
                <span className="font-light text-foreground tracking-tighter">
                    Welcome Back
                </span>
            }
            description="Sign in to continue your journey with ClearSprint AI"
            heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
            testimonials={sampleTestimonials}
            onSignIn={handleSignIn}
            onAtlassianSignIn={handleAtlassianSignIn}
            onResetPassword={handleResetPassword}
            onCreateAccount={handleCreateAccount}
            onGoBack={handleGoBack}
            isLoading={loading}
        />
    );
}
