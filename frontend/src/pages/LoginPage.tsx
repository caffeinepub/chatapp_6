import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { MessageSquare, Shield, Zap } from 'lucide-react';

export function LoginPage() {
    const { login, isLoggingIn } = useInternetIdentity();

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Header */}
            <header className="flex items-center gap-3 border-b border-border px-6 py-4">
                <img
                    src="/assets/generated/chat-logo.dim_128x128.png"
                    alt="ChatApp"
                    className="h-8 w-8 rounded-lg"
                />
                <span className="text-lg font-semibold tracking-tight">ChatApp</span>
            </header>

            {/* Main */}
            <main className="flex flex-1 flex-col items-center justify-center px-4">
                <div className="w-full max-w-md space-y-8">
                    {/* Hero */}
                    <div className="text-center space-y-4">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                            <img
                                src="/assets/generated/chat-logo.dim_128x128.png"
                                alt="ChatApp"
                                className="h-12 w-12 rounded-xl"
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Welcome to ChatApp</h1>
                            <p className="mt-2 text-muted-foreground">
                                Private, secure messaging on the Internet Computer.
                            </p>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { icon: Shield, label: 'Private', desc: 'End-to-end on-chain' },
                            { icon: Zap, label: 'Fast', desc: 'Near real-time' },
                            { icon: MessageSquare, label: 'Simple', desc: 'Clean interface' }
                        ].map(({ icon: Icon, label, desc }) => (
                            <div
                                key={label}
                                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                    <Icon className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{label}</p>
                                    <p className="text-xs text-muted-foreground">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Login card */}
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-chat space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold">Sign in to continue</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Use Internet Identity — supports passkeys and Google sign-in.
                            </p>
                        </div>
                        <Button
                            onClick={login}
                            disabled={isLoggingIn}
                            className="w-full h-11 text-base font-medium"
                            size="lg"
                        >
                            {isLoggingIn ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Connecting…
                                </span>
                            ) : (
                                'Sign in with Internet Identity'
                            )}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            No password required. Your identity is secured by cryptography.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} ChatApp &mdash; Built with{' '}
                <span className="text-destructive">♥</span> using{' '}
                <a
                    href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'chatapp')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                    caffeine.ai
                </a>
            </footer>
        </div>
    );
}
