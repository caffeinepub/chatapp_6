import { useState, useRef, useEffect } from 'react';
import { useGetConversation, useSendMessage } from '../hooks/useQueries';
import type { ChatUser, Message } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send, MessageSquareDashed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MessageThreadProps {
    selectedUser: ChatUser | null;
    currentUser: ChatUser | null;
    onBack: () => void;
}

function getInitials(name: string) {
    return name.slice(0, 2).toUpperCase();
}

function formatMessageTime(ts: bigint): string {
    const ms = Number(ts / BigInt(1_000_000));
    return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function groupMessagesByDate(messages: Message[]): { date: string; messages: Message[] }[] {
    const groups: Map<string, Message[]> = new Map();
    for (const msg of messages) {
        const ms = Number(msg.timestamp / BigInt(1_000_000));
        const dateKey = new Date(ms).toLocaleDateString([], {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
        if (!groups.has(dateKey)) groups.set(dateKey, []);
        groups.get(dateKey)!.push(msg);
    }
    return Array.from(groups.entries()).map(([date, messages]) => ({ date, messages }));
}

export function MessageThread({ selectedUser, currentUser, onBack }: MessageThreadProps) {
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { data: messages = [], isLoading } = useGetConversation(selectedUser?.principal ?? null);
    const sendMessage = useSendMessage();

    // Scroll to bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        const content = input.trim();
        if (!content || !selectedUser) return;

        setInput('');
        try {
            await sendMessage.mutateAsync({ recipient: selectedUser.principal, content });
        } catch {
            toast.error('Failed to send message. Please try again.');
            setInput(content);
        }
        textareaRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!selectedUser) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center px-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                    <MessageSquareDashed className="h-7 w-7 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">Select a conversation</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Choose from your existing conversations or start a new one.
                    </p>
                </div>
            </div>
        );
    }

    const grouped = groupMessagesByDate(messages);

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            {/* Thread header */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3 flex-shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="h-8 w-8 md:hidden"
                    aria-label="Back"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs font-semibold bg-primary/15 text-primary">
                        {getInitials(selectedUser.displayName)}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{selectedUser.displayName}</p>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-3">
                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}
                            >
                                <Skeleton
                                    className={cn(
                                        'h-9 rounded-2xl',
                                        i % 2 === 0 ? 'w-48' : 'w-36'
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                ) : grouped.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-12">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className="text-base font-semibold bg-primary/15 text-primary">
                                {getInitials(selectedUser.displayName)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium">{selectedUser.displayName}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                No messages yet. Say hello!
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {grouped.map(({ date, messages: dayMessages }) => (
                            <div key={date}>
                                {/* Date separator */}
                                <div className="flex items-center gap-3 my-3">
                                    <div className="flex-1 h-px bg-border" />
                                    <span className="text-xs text-muted-foreground px-2">{date}</span>
                                    <div className="flex-1 h-px bg-border" />
                                </div>
                                <div className="space-y-1.5">
                                    {dayMessages.map((msg) => {
                                        const isMine = msg.sender === currentUser?.principal;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={cn(
                                                    'flex items-end gap-2',
                                                    isMine ? 'justify-end' : 'justify-start'
                                                )}
                                            >
                                                {!isMine && (
                                                    <Avatar className="h-6 w-6 flex-shrink-0 mb-0.5">
                                                        <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                                                            {getInitials(selectedUser.displayName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div
                                                    className={cn(
                                                        'max-w-[70%] rounded-2xl px-3.5 py-2 text-sm',
                                                        isMine
                                                            ? 'bubble-sent rounded-br-sm'
                                                            : 'bubble-received rounded-bl-sm'
                                                    )}
                                                >
                                                    <p className="leading-relaxed break-words">{msg.content}</p>
                                                    <p
                                                        className={cn(
                                                            'text-[10px] mt-1 text-right',
                                                            isMine
                                                                ? 'text-primary-foreground/60'
                                                                : 'text-muted-foreground'
                                                        )}
                                                    >
                                                        {formatMessageTime(msg.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                )}
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-border px-4 py-3 flex-shrink-0">
                <div className="flex items-end gap-2">
                    <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Message ${selectedUser.displayName}…`}
                        rows={1}
                        className="min-h-[40px] max-h-32 resize-none flex-1 text-sm"
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!input.trim() || sendMessage.isPending}
                        className="h-10 w-10 flex-shrink-0"
                        aria-label="Send message"
                    >
                        {sendMessage.isPending ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
