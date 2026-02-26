import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useRegisterUser } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, AlertCircle } from 'lucide-react';

interface SetupPageProps {
    onComplete: () => void;
}

export function SetupPage({ onComplete }: SetupPageProps) {
    const { identity, clear } = useInternetIdentity();
    const [displayName, setDisplayName] = useState('');
    const [inlineError, setInlineError] = useState<string | null>(null);
    const registerUser = useRegisterUser();

    const principal = identity?.getPrincipal().toString() ?? '';
    const shortPrincipal = principal.length > 20 ? `${principal.slice(0, 10)}…${principal.slice(-6)}` : principal;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setInlineError(null);
        const trimmed = displayName.trim();
        if (!trimmed) return;
        if (trimmed.length < 2) {
            setInlineError('Display name must be at least 2 characters.');
            return;
        }
        if (trimmed.length > 32) {
            setInlineError('Display name must be 32 characters or fewer.');
            return;
        }

        try {
            await registerUser.mutateAsync(trimmed);
            onComplete();
        } catch (err: unknown) {
            // Log full details for debugging
            console.error('[SetupPage] Failed to register user:', {
                error: err,
                principal,
            });

            // Parse error for a human-readable message
            let message = 'Failed to create profile. Please try again.';
            if (err instanceof Error) {
                const msg = err.message.toLowerCase();
                if (msg.includes('network') || msg.includes('fetch') || msg.includes('connection')) {
                    message = 'Network error — please check your connection and try again.';
                } else if (msg.includes('already registered')) {
                    message = 'This identity is already registered. Please refresh the page.';
                } else if (msg.includes('anonymous')) {
                    message = 'Anonymous principals cannot register. Please log in first.';
                } else if (msg.includes('unauthorized') || msg.includes('trap')) {
                    message = `Registration rejected: ${err.message}`;
                } else if (msg.includes('actor not initialized')) {
                    message = 'Connection not ready. Please wait a moment and try again.';
                } else {
                    message = `Registration failed: ${err.message}`;
                }
            }
            setInlineError(message);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-6">
                {/* Icon */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                        <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Set your display name</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            This is how other users will see you in the app.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-chat space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Display name</Label>
                        <Input
                            id="displayName"
                            placeholder="e.g. Alice"
                            value={displayName}
                            onChange={(e) => {
                                setDisplayName(e.target.value);
                                if (inlineError) setInlineError(null);
                            }}
                            maxLength={32}
                            autoFocus
                            className="h-10"
                        />
                        <p className="text-xs text-muted-foreground">2–32 characters</p>
                    </div>

                    {/* Inline error */}
                    {inlineError && (
                        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                            <p className="text-xs text-destructive">{inlineError}</p>
                        </div>
                    )}

                    <div className="rounded-lg bg-muted/50 px-3 py-2">
                        <p className="text-xs text-muted-foreground">
                            Principal:{' '}
                            <span className="font-mono text-foreground break-all">{shortPrincipal}</span>
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={!displayName.trim() || registerUser.isPending}
                    >
                        {registerUser.isPending ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Creating profile…
                            </span>
                        ) : (
                            'Continue'
                        )}
                    </Button>
                </form>

                <button
                    onClick={clear}
                    className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    Sign out and use a different identity
                </button>
            </div>
        </div>
    );
}
