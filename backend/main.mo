import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ----- User Profile -----
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ---- Application Data Types ----

  public type Task = {
    id : Nat;
    description : Text;
  };

  public type Workflow = {
    id : Nat;
    name : Text;
    tasks : [Task];
  };

  public type Project = {
    id : Nat;
    name : Text;
    workflows : [Workflow];
  };

  // ---- Project Storage ----
  let projects = Map.empty<Nat, Project>();
  var nextProjectId : Nat = 0;
  var nextWorkflowId : Nat = 0;
  var nextTaskId : Nat = 0;

  public query ({ caller }) func getProjects() : async [Project] {
    // Any authenticated user can view projects
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view projects");
    };
    projects.values().toArray();
  };

  public query ({ caller }) func getProject(id : Nat) : async ?Project {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view projects");
    };
    projects.get(id);
  };

  public shared ({ caller }) func createProject(name : Text) : async Project {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create projects");
    };
    let id = nextProjectId;
    nextProjectId += 1;
    let project : Project = {
      id = id;
      name = name;
      workflows = [];
    };
    projects.add(id, project);
    project;
  };

  public shared ({ caller }) func updateProject(project : Project) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update projects");
    };
    projects.add(project.id, project);
  };

  public shared ({ caller }) func deleteProject(id : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete projects");
    };
    projects.remove(id);
  };

  public shared ({ caller }) func addWorkflow(projectId : Nat, name : Text) : async Workflow {
    await assertUserAccess(caller, projectId);

    let workflowId = nextWorkflowId;
    nextWorkflowId += 1;
    let workflow : Workflow = {
      id = workflowId;
      name;
      tasks = [];
    };

    switch (projects.get(projectId)) {
      case (null) { Runtime.trap("Project not found") };
      case (?project) {
        let updatedWorkflows = project.workflows.concat([workflow]);
        let updatedProject = { project with workflows = updatedWorkflows };
        projects.add(projectId, updatedProject);
      };
    };
    workflow;
  };

  public shared ({ caller }) func addTask(projectId : Nat, workflowId : Nat, description : Text) : async Task {
    await assertUserAccess(caller, projectId);

    let taskId = nextTaskId;
    nextTaskId += 1;
    let task : Task = {
      id = taskId;
      description;
    };

    switch (projects.get(projectId)) {
      case (null) { Runtime.trap("Project not found") };
      case (?project) {
        var workflowFound = false;
        let newWorkflows = project.workflows.map(func(w) {
          if (w.id == workflowId) {
            workflowFound := true;
            { w with tasks = w.tasks.concat([task]) };
          } else { w };
        });
        if (workflowFound) {
          let updatedProject = { project with workflows = newWorkflows };
          projects.add(projectId, updatedProject);
        } else {
          Runtime.trap("Workflow not found");
        };
      };
    };
    task;
  };

  // ---- Helper Functions ----
  public query ({ caller }) func assertUserAccess(caller : Principal, projectId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access projects");
    };
    if (projects.get(projectId) == null) {
      Runtime.trap("Project not found");
    };
  };

  // ---- Role Management (admin only) ----
  public shared ({ caller }) func assignRole(user : Principal, role : AccessControl.UserRole) : async () {
    // assignRole includes admin-only guard internally
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func getUserRole(user : Principal) : async AccessControl.UserRole {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view user roles");
    };
    AccessControl.getUserRole(accessControlState, user);
  };

  // ---- User Registration ----
  public shared ({ caller }) func registerUser(displayName : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous principals cannot register");
    };
    if (AccessControl.getUserRole(accessControlState, caller) != #guest) {
      Runtime.trap("User is already registered");
    };
    let profile : UserProfile = { name = displayName };
    userProfiles.add(caller, profile);
    AccessControl.assignRole(accessControlState, caller, caller, #user);
  };
};
