import { useState } from 'react';
import { useGetMyConversations, useGetUsers } from '../hooks/useQueries';
import type { ChatUser, Conversation } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Search, Plus, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationListProps {
    selectedUser: ChatUser | null;
    onSelectUser: (user: ChatUser) => void;
    currentUser: ChatUser | null;
}

function getInitials(name: string) {
    return name.slice(0, 2).toUpperCase();
}

function formatTimestamp(ts: bigint): string {
    const ms = Number(ts / BigInt(1_000_000));
    const date = new Date(ms);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86_400_000);
    if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function NewChatDialog({
    onSelectUser,
    currentUser
}: {
    onSelectUser: (user: ChatUser) => void;
    currentUser: ChatUser | null;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const { data: users = [], isLoading } = useGetUsers();

    const filtered = users.filter(
        (u) =>
            u.principal !== currentUser?.principal &&
            u.displayName.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (user: ChatUser) => {
        onSelectUser(user);
        setOpen(false);
        setSearch('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" aria-label="New chat">
                    <Plus className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>New Conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                            autoFocus
                        />
                    </div>
                    <ScrollArea className="h-64">
                        {isLoading ? (
                            <div className="space-y-2 p-1">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2">
                                        <Skeleton className="h-9 w-9 rounded-full" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                ))}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-center">
                                <p className="text-sm text-muted-foreground">
                                    {search ? 'No users found' : 'No other users registered yet'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-1 p-1">
                                {filtered.map((user) => (
                                    <button
                                        key={user.principal}
                                        onClick={() => handleSelect(user)}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-accent transition-colors"
                                    >
                                        <Avatar className="h-9 w-9 flex-shrink-0">
                                            <AvatarFallback className="text-sm font-semibold bg-primary/15 text-primary">
                                                {getInitials(user.displayName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{user.displayName}</p>
                                            <p className="text-xs text-muted-foreground font-mono truncate">
                                                {user.principal.slice(0, 16)}…
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function ConversationList({ selectedUser, onSelectUser, currentUser }: ConversationListProps) {
    const [search, setSearch] = useState('');
    const { data: conversations = [], isLoading } = useGetMyConversations();

    const filtered = conversations.filter((c) =>
        c.otherUser.displayName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
                <h2 className="text-sm font-semibold">Messages</h2>
                <NewChatDialog onSelectUser={onSelectUser} currentUser={currentUser} />
            </div>

            {/* Search */}
            <div className="px-3 py-2 flex-shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search conversations…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 h-8 text-sm bg-muted/50 border-transparent focus-visible:border-border"
                    />
                </div>
            </div>

            {/* List */}
            <ScrollArea className="flex-1">
                {isLoading ? (
                    <div className="space-y-1 p-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 rounded-lg p-3">
                                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-3.5 w-24" />
                                    <Skeleton className="h-3 w-40" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 px-4 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <MessageSquare className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">
                                {search ? 'No results' : 'No conversations yet'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {search ? 'Try a different search' : 'Start a new chat with the + button'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-0.5 p-2">
                        {filtered.map((conv) => (
                            <ConversationItem
                                key={conv.otherUser.principal}
                                conversation={conv}
                                isSelected={selectedUser?.principal === conv.otherUser.principal}
                                onClick={() => onSelectUser(conv.otherUser)}
                                currentUserPrincipal={currentUser?.principal ?? ''}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}

function ConversationItem({
    conversation,
    isSelected,
    onClick,
    currentUserPrincipal
}: {
    conversation: Conversation;
    isSelected: boolean;
    onClick: () => void;
    currentUserPrincipal: string;
}) {
    const { otherUser, lastMessage } = conversation;
    const isMine = lastMessage?.sender === currentUserPrincipal;

    return (
        <button
            onClick={onClick}
            className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                isSelected
                    ? 'bg-primary/10 text-foreground'
                    : 'hover:bg-accent/60'
            )}
        >
            <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback
                    className={cn(
                        'text-sm font-semibold',
                        isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    )}
                >
                    {getInitials(otherUser.displayName)}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{otherUser.displayName}</p>
                    {lastMessage && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatTimestamp(lastMessage.timestamp)}
                        </span>
                    )}
                </div>
                {lastMessage && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {isMine ? 'You: ' : ''}{lastMessage.content}
                    </p>
                )}
            </div>
        </button>
    );
}
