import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Moon, Sun, ChevronDown, Copy, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import type { ChatUser } from '../hooks/useQueries';

interface ChatHeaderProps {
    currentUser: ChatUser | null;
}

function truncatePrincipal(principal: string): string {
    if (!principal) return '';
    if (principal.length <= 20) return principal;
    return `${principal.slice(0, 10)}…${principal.slice(-6)}`;
}

export function ChatHeader({ currentUser }: ChatHeaderProps) {
    const { clear, identity } = useInternetIdentity();
    const { theme, setTheme } = useTheme();
    const [copied, setCopied] = useState(false);

    const principal = identity?.getPrincipal().toString() ?? currentUser?.principal ?? '';

    const initials = currentUser?.displayName
        ? currentUser.displayName.slice(0, 2).toUpperCase()
        : '??';

    const handleCopyPrincipal = async () => {
        if (!principal) return;
        try {
            await navigator.clipboard.writeText(principal);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard not available
        }
    };

    return (
        <header className="flex items-center justify-between border-b border-border chat-header px-4 py-3 flex-shrink-0 z-10">
            <div className="flex items-center gap-3">
                <img
                    src="/assets/generated/chat-logo.dim_128x128.png"
                    alt="ChatApp"
                    className="h-7 w-7 rounded-lg"
                />
                <span className="text-base font-semibold tracking-tight">ChatApp</span>
            </div>

            <div className="flex items-center gap-2">
                {/* Theme toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="h-8 w-8"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 h-8 px-2">
                            <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs bg-primary/20 text-primary font-semibold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium hidden sm:block">
                                {currentUser?.displayName ?? 'You'}
                            </span>
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                        {currentUser && (
                            <>
                                <DropdownMenuLabel className="font-normal pb-1">
                                    <p className="text-sm font-semibold leading-tight">
                                        {currentUser.displayName}
                                    </p>
                                </DropdownMenuLabel>
                                {principal && (
                                    <div className="px-2 pb-2">
                                        <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide font-medium">
                                            Principal ID
                                        </p>
                                        <div className="flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1.5">
                                            <p className="text-xs text-foreground font-mono flex-1 truncate">
                                                {truncatePrincipal(principal)}
                                            </p>
                                            <button
                                                onClick={handleCopyPrincipal}
                                                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                                                title="Copy full principal ID"
                                            >
                                                {copied
                                                    ? <Check className="h-3 w-3 text-green-500" />
                                                    : <Copy className="h-3 w-3" />
                                                }
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <DropdownMenuSeparator />
                            </>
                        )}
                        <DropdownMenuItem
                            onClick={clear}
                            className="text-destructive focus:text-destructive"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
