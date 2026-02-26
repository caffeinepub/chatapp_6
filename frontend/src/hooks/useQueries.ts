import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Project, Workflow, Task } from '../backend';

// Re-export backend types for convenience
export type { UserProfile, Project, Workflow, Task };

// ─── Local Chat UI Types ──────────────────────────────────────────────────────
// These are frontend-only types used by the chat UI layer.
// They differ from the backend UserProfile which only has { name: string }.

export interface ChatUser {
    principal: string;
    displayName: string;
}

export interface Message {
    id: string;
    sender: string;
    recipient: string;
    content: string;
    timestamp: bigint;
}

export interface Conversation {
    otherUser: ChatUser;
    lastMessage: Message | null;
    unreadCount: number;
}

// ─── User Profile Hooks ───────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
    const { actor, isFetching: actorFetching } = useActor();

    const query = useQuery<UserProfile | null>({
        queryKey: ['currentUserProfile'],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getCallerUserProfile();
        },
        enabled: !!actor && !actorFetching,
        retry: false,
    });

    return {
        ...query,
        isLoading: actorFetching || query.isLoading,
        isFetched: !!actor && query.isFetched,
    };
}

export function useSaveCallerUserProfile() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (profile: UserProfile) => {
            if (!actor) throw new Error('Actor not initialized');
            return actor.saveCallerUserProfile(profile);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        },
        onError: (error: unknown) => {
            console.error('[useSaveCallerUserProfile] Profile save failed:', error);
        },
    });
}

// ─── Chat UI Hooks (use local ChatUser type) ──────────────────────────────────

export function useGetCurrentUser() {
    const { actor, isFetching } = useActor();

    return useQuery<ChatUser | null>({
        queryKey: ['currentUser'],
        queryFn: async () => {
            if (!actor) return null;
            try {
                const result = await actor.getCallerUserProfile();
                if (!result) return null;
                // We don't have the principal here from the profile alone;
                // return a ChatUser with name mapped to displayName.
                // Principal will be filled in by the caller via identity if needed.
                return { principal: '', displayName: result.name };
            } catch {
                return null;
            }
        },
        enabled: !!actor && !isFetching,
        staleTime: 30_000,
    });
}

export function useGetUsers() {
    const { actor, isFetching } = useActor();

    return useQuery<ChatUser[]>({
        queryKey: ['users'],
        queryFn: async () => {
            if (!actor) return [];
            try {
                // Backend does not expose a list-all-users endpoint yet
                return [];
            } catch {
                return [];
            }
        },
        enabled: !!actor && !isFetching,
        staleTime: 30_000,
    });
}

export function useGetMyConversations() {
    const { actor, isFetching } = useActor();

    return useQuery<Conversation[]>({
        queryKey: ['conversations'],
        queryFn: async () => {
            if (!actor) return [];
            try {
                // Backend does not expose conversations yet
                return [];
            } catch {
                return [];
            }
        },
        enabled: !!actor && !isFetching,
        refetchInterval: 5_000,
        staleTime: 4_000,
    });
}

export function useGetConversation(otherUserPrincipal: string | null) {
    const { actor, isFetching } = useActor();

    return useQuery<Message[]>({
        queryKey: ['conversation', otherUserPrincipal],
        queryFn: async () => {
            if (!actor || !otherUserPrincipal) return [];
            try {
                // Backend does not expose messaging yet
                return [];
            } catch {
                return [];
            }
        },
        enabled: !!actor && !isFetching && !!otherUserPrincipal,
        refetchInterval: 5_000,
        staleTime: 4_000,
    });
}

export function useSendMessage() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ recipient, content }: { recipient: string; content: string }) => {
            if (!actor) throw new Error('Actor not initialized');
            // Backend does not expose messaging yet
            void recipient;
            void content;
            throw new Error('Messaging not yet implemented on the backend.');
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['conversation', variables.recipient] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });
}

// ─── Project Hooks ────────────────────────────────────────────────────────────

export function useGetProjects() {
    const { actor, isFetching } = useActor();

    return useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getProjects();
        },
        enabled: !!actor && !isFetching,
        staleTime: 10_000,
    });
}

export function useGetProject(id: bigint | null) {
    const { actor, isFetching } = useActor();

    return useQuery<Project | null>({
        queryKey: ['project', id?.toString()],
        queryFn: async () => {
            if (!actor || id === null) return null;
            return actor.getProject(id);
        },
        enabled: !!actor && !isFetching && id !== null,
        staleTime: 10_000,
    });
}

export function useCreateProject() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (name: string) => {
            if (!actor) throw new Error('Actor not initialized');
            return actor.createProject(name);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
        onError: (error: unknown) => {
            console.error('[useCreateProject] Failed:', error);
        },
    });
}

export function useUpdateProject() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (project: Project) => {
            if (!actor) throw new Error('Actor not initialized');
            return actor.updateProject(project);
        },
        onSuccess: (_data, project) => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['project', project.id.toString()] });
        },
        onError: (error: unknown) => {
            console.error('[useUpdateProject] Failed:', error);
        },
    });
}

export function useDeleteProject() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: bigint) => {
            if (!actor) throw new Error('Actor not initialized');
            return actor.deleteProject(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
        onError: (error: unknown) => {
            console.error('[useDeleteProject] Failed:', error);
        },
    });
}

export function useAddWorkflow() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId, name }: { projectId: bigint; name: string }): Promise<Workflow> => {
            if (!actor) throw new Error('Actor not initialized');
            return actor.addWorkflow(projectId, name);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
        onError: (error: unknown) => {
            console.error('[useAddWorkflow] Failed:', error);
        },
    });
}

export function useAddTask() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            projectId,
            workflowId,
            description,
        }: {
            projectId: bigint;
            workflowId: bigint;
            description: string;
        }): Promise<Task> => {
            if (!actor) throw new Error('Actor not initialized');
            return actor.addTask(projectId, workflowId, description);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
        onError: (error: unknown) => {
            console.error('[useAddTask] Failed:', error);
        },
    });
}
