import { ThemeProvider } from 'next-themes';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { LoginPage } from './pages/LoginPage';
import { SetupPage } from './pages/SetupPage';
import { ChatPage } from './pages/ChatPage';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { Toaster } from '@/components/ui/sonner';
import { useQueryClient } from '@tanstack/react-query';

function AppContent() {
    const { identity, isInitializing, clear } = useInternetIdentity();
    const queryClient = useQueryClient();
    const {
        data: userProfile,
        isLoading: profileLoading,
        isFetched,
    } = useGetCallerUserProfile();

    const isAuthenticated = !!identity;

    // Show loading while identity is initializing or while we're fetching the profile for an authenticated user
    if (isInitializing || (isAuthenticated && profileLoading)) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <img
                        src="/assets/generated/chat-logo.dim_128x128.png"
                        alt="App Logo"
                        className="h-12 w-12 animate-pulse rounded-xl"
                    />
                    <p className="text-sm text-muted-foreground">Loading…</p>
                </div>
            </div>
        );
    }

    // Not logged in → show login page
    if (!isAuthenticated) {
        return <LoginPage />;
    }

    // Authenticated but no profile yet → show setup page
    // Only show after we've confirmed the profile fetch completed (isFetched) to avoid flash
    const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

    if (showProfileSetup) {
        return (
            <SetupPage
                onComplete={() => {
                    // Invalidate so App re-reads the profile and transitions to ChatPage
                    queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
                }}
            />
        );
    }

    // Profile exists → show main app
    if (userProfile) {
        return <ChatPage />;
    }

    // Fallback: still waiting for profile data
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <img
                    src="/assets/generated/chat-logo.dim_128x128.png"
                    alt="App Logo"
                    className="h-12 w-12 animate-pulse rounded-xl"
                />
                <p className="text-sm text-muted-foreground">Loading…</p>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <AppContent />
            <Toaster richColors position="top-right" />
        </ThemeProvider>
    );
}
