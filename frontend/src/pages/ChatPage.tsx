import { useState } from 'react';
import { ConversationList } from '../components/ConversationList';
import { MessageThread } from '../components/MessageThread';
import { ChatHeader } from '../components/ChatHeader';
import { useGetCurrentUser } from '../hooks/useQueries';
import type { ChatUser } from '../hooks/useQueries';

export function ChatPage() {
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
    const [mobileView, setMobileView] = useState<'list' | 'thread'>('list');
    const { data: currentUser } = useGetCurrentUser();

    const handleSelectUser = (user: ChatUser) => {
        setSelectedUser(user);
        setMobileView('thread');
    };

    const handleBack = () => {
        setMobileView('list');
    };

    return (
        <div className="flex h-screen flex-col bg-background overflow-hidden">
            <ChatHeader currentUser={currentUser ?? null} />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar — conversation list */}
                <aside
                    className={`
                        flex-shrink-0 w-full md:w-80 lg:w-96 border-r border-border chat-sidebar
                        flex flex-col overflow-hidden
                        ${mobileView === 'thread' ? 'hidden md:flex' : 'flex'}
                    `}
                >
                    <ConversationList
                        selectedUser={selectedUser}
                        onSelectUser={handleSelectUser}
                        currentUser={currentUser ?? null}
                    />
                </aside>

                {/* Main — message thread */}
                <main
                    className={`
                        flex-1 flex flex-col overflow-hidden
                        ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
                    `}
                >
                    <MessageThread
                        selectedUser={selectedUser}
                        currentUser={currentUser ?? null}
                        onBack={handleBack}
                    />
                </main>
            </div>
        </div>
    );
}
