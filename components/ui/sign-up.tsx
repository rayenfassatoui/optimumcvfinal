import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { AuthShader } from '@/components/ui/auth-shader';
import { Spinner } from '@/components/ui/spinner';

// --- HELPER COMPONENTS (ICONS) ---

const AtlassianIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 256 256"
    >
        <defs>
            <linearGradient
                x1="99.7%"
                y1="15.8%"
                x2="39.8%"
                y2="97.4%"
                id="atlassian-a"
            >
                <stop stopColor="#0052CC" offset="0%" />
                <stop stopColor="#2684FF" offset="92.3%" />
            </linearGradient>
        </defs>
        <path
            d="M76 118c-4-4-10-4-13 1L1 245a7 7 0 0 0 6 10h88c3 0 5-1 6-4 19-39 8-98-25-133Z"
            fill="url(#atlassian-a)"
        />
        <path
            d="M122 4c-35 56-33 117-10 163l42 84c1 3 4 4 7 4h87a7 7 0 0 0 7-10L134 4c-2-5-9-5-12 0Z"
            fill="#2681FF"
        />
    </svg>
);

// --- TYPE DEFINITIONS ---

export interface Testimonial {
    avatarSrc: string;
    name: string;
    handle: string;
    text: string;
}

interface SignUpPageProps {
    title?: React.ReactNode;
    description?: React.ReactNode;
    heroImageSrc?: string;
    testimonials?: Testimonial[];
    onSignUp?: (event: React.FormEvent<HTMLFormElement>) => void;
    onAtlassianSignUp?: () => void;
    onSignIn?: () => void;
    onGoBack?: () => void;
    isLoading?: boolean;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-2xl border border-input bg-background/50 backdrop-blur-sm transition-all focus-within:border-primary/50 focus-within:bg-primary/5 focus-within:ring-2 focus-within:ring-primary/10">
        {children}
    </div>
);

const TestimonialCard = ({
    testimonial,
    delay,
}: {
    testimonial: Testimonial;
    delay: string;
}) => (
    <div
        className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-card/60 backdrop-blur-xl border border-border/50 p-4 sm:p-5 w-full sm:w-64 md:w-72 lg:w-64 shadow-lg`}
    >
        <img
            src={testimonial.avatarSrc}
            className="h-10 w-10 object-cover rounded-2xl shrink-0"
            alt="avatar"
        />
        <div className="text-sm leading-snug min-w-0">
            <p className="flex items-center gap-1 font-medium truncate">
                {testimonial.name}
            </p>
            <p className="text-muted-foreground text-xs">{testimonial.handle}</p>
            <p className="mt-1 text-foreground/80 line-clamp-3">{testimonial.text}</p>
        </div>
    </div>
);

// --- MAIN COMPONENT ---

export const SignUpPage: React.FC<SignUpPageProps> = ({
    title = (
        <span className="font-light text-foreground tracking-tighter">
            Create Account
        </span>
    ),
    description = 'Start your journey with us today',
    heroImageSrc,
    testimonials = [],
    onSignUp,
    onAtlassianSignUp,
    onSignIn,
    onGoBack,
    isLoading = false,
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen flex flex-col md:flex-row font-geist overflow-hidden">
            {/* Left column: sign-up form */}
            <section className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="flex flex-col gap-6">
                        {/* Go Back Button */}
                        {onGoBack && (
                            <button
                                type="button"
                                onClick={onGoBack}
                                className="animate-element animate-delay-50 group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                            >
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                <span>Back to home</span>
                            </button>
                        )}
                        <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight">
                            {title}
                        </h1>
                        <p className="animate-element animate-delay-200 text-muted-foreground">
                            {description}
                        </p>

                        <form className="space-y-5" onSubmit={onSignUp}>
                            <div className="animate-element animate-delay-300">
                                <label
                                    htmlFor="name"
                                    className="text-sm font-medium text-muted-foreground"
                                >
                                    Full Name
                                </label>
                                <GlassInputWrapper>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                                    />
                                </GlassInputWrapper>
                            </div>

                            <div className="animate-element animate-delay-400">
                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium text-muted-foreground"
                                >
                                    Email Address
                                </label>
                                <GlassInputWrapper>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter your email address"
                                        className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                                    />
                                </GlassInputWrapper>
                            </div>

                            <div className="animate-element animate-delay-500">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-muted-foreground"
                                >
                                    Password
                                </label>
                                <GlassInputWrapper>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter your password"
                                            className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-3 flex items-center"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                                            ) : (
                                                <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                                            )}
                                        </button>
                                    </div>
                                </GlassInputWrapper>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="animate-element animate-delay-600 group w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner className="w-4 h-4 text-primary-foreground" />
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="animate-element animate-delay-700 relative flex items-center justify-center">
                            <span className="w-full border-t border-border"></span>
                            <span className="px-4 text-sm text-muted-foreground bg-background absolute">
                                Or continue with
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={onAtlassianSignUp}
                            className="animate-element animate-delay-800 w-full flex items-center justify-center gap-3 border border-border rounded-2xl py-4 hover:bg-secondary transition-all hover:scale-[1.01] hover:border-border/80"
                        >
                            <AtlassianIcon />
                            <span>Continue with Atlassian</span>
                        </button>

                        <p className="animate-element animate-delay-900 text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => onSignIn?.()}
                                className="text-primary hover:underline transition-colors font-medium bg-transparent border-none p-0 cursor-pointer"
                            >
                                Sign in instead
                            </button>
                        </p>
                    </div>
                </div>
            </section>

            {/* Right column: shader background + testimonials */}
            <section className="hidden md:block flex-1 relative p-4">
                <div className="absolute inset-4 rounded-3xl overflow-hidden">
                    <AuthShader />
                </div>

                {testimonials.length > 0 && (
                    <div className="absolute inset-0 z-10 pointer-events-none p-8">
                        {/* Top Right */}
                        <div className="absolute top-12 right-8 animate-float-1 hidden lg:block pointer-events-auto">
                            <TestimonialCard
                                testimonial={testimonials[0]}
                                delay="animate-delay-1000"
                            />
                        </div>

                        {/* Center Left */}
                        {testimonials[1] && (
                            <div className="absolute top-1/2 left-8 -translate-y-1/2 animate-float-2 hidden xl:block pointer-events-auto">
                                <TestimonialCard
                                    testimonial={testimonials[1]}
                                    delay="animate-delay-1200"
                                />
                            </div>
                        )}

                        {/* Bottom Right */}
                        {testimonials[2] && (
                            <div className="absolute bottom-12 right-12 animate-float-3 hidden md:block pointer-events-auto">
                                <TestimonialCard
                                    testimonial={testimonials[2]}
                                    delay="animate-delay-1400"
                                />
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};
