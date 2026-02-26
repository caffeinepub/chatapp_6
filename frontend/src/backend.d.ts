import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Task {
    id: bigint;
    description: string;
}
export interface Project {
    id: bigint;
    workflows: Array<Workflow>;
    name: string;
}
export interface UserProfile {
    name: string;
}
export interface Workflow {
    id: bigint;
    tasks: Array<Task>;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTask(projectId: bigint, workflowId: bigint, description: string): Promise<Task>;
    addWorkflow(projectId: bigint, name: string): Promise<Workflow>;
    assertUserAccess(caller: Principal, projectId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignRole(user: Principal, role: UserRole): Promise<void>;
    createProject(name: string): Promise<Project>;
    deleteProject(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProject(id: bigint): Promise<Project | null>;
    getProjects(): Promise<Array<Project>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserRole(user: Principal): Promise<UserRole>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateProject(project: Project): Promise<void>;
}
