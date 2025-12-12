'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    SignUpPage,
    type Testimonial,
} from '@/components/ui/sign-up';
import { authClient } from '@/lib/auth-client';

const sampleTestimonials: Testimonial[] = [
    {
        avatarSrc: 'https://randomuser.me/api/portraits/women/44.jpg',
        name: 'Emily Rodriguez',
        handle: '@emilydesigns',
        text: 'The best decision I made for my workflow. Everything just works seamlessly!',
    },
    {
        avatarSrc: 'https://randomuser.me/api/portraits/men/86.jpg',
        name: 'Alex Thompson',
        handle: '@alexbuilds',
        text: "Incredible platform! It's helped me stay organized and productive like never before.",
    },
    {
        avatarSrc: 'https://randomuser.me/api/portraits/women/68.jpg',
        name: 'Jessica Park',
        handle: '@jessicapm',
        text: 'Game changer for project management. The interface is beautiful and intuitive.',
    },
];

export default function SignUp() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const name = formData.get('name') as string;

        if (!email || !password || !name) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await authClient.signUp.email(
                {
                    email,
                    password,
                    name,
                },
                {
                    onRequest: () => {
                        setLoading(true);
                    },
                    onSuccess: () => {
                        toast.success('Account created successfully');
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

    const handleAtlassianSignUp = async () => {
        setLoading(true);
        try {
            await authClient.signIn.social({
                provider: 'atlassian',
                callbackURL: '/dashboard',
            });
        } catch (error) {
            console.error('Atlassian sign-up error:', error);
            toast.error('Failed to sign up with Atlassian');
            setLoading(false);
        }
    };

    const handleSignIn = () => {
        router.push('/auth/signin');
    };

    const handleGoBack = () => {
        router.push('/');
    };

    return (
        <SignUpPage
            title={
                <span className="font-light text-foreground tracking-tighter">
                    Create Account
                </span>
            }
            description="Start building your product backlog with ClearSprint AI"
            heroImageSrc="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=2160&q=80"
            testimonials={sampleTestimonials}
            onSignUp={handleSignUp}
            onAtlassianSignUp={handleAtlassianSignUp}
            onSignIn={handleSignIn}
            onGoBack={handleGoBack}
            isLoading={loading}
        />
    );
}
