# Specification

## Summary
**Goal:** Fix post-login backend request errors and display the logged-in user's principal ID in the chat header.

**Planned changes:**
- Audit and fix `backend/main.mo` to ensure correct function signatures and stable variable declarations for `registerUser` and any other backend calls
- Update the frontend Candid actor interface in `frontend/src/hooks/useQueries.ts` to exactly match the deployed backend API
- Fix the `registerUser` mutation in `frontend/src/pages/SetupPage.tsx` to correctly invoke the actor with the display name argument
- Display the authenticated user's principal ID (truncated or full) in `frontend/src/components/ChatHeader.tsx` inside the user dropdown or next to the display name

**User-visible outcome:** After logging in with Internet Identity, no "Error in sending request" errors appear, the user profile is successfully created on first login, and the user's principal ID is visible in the chat header area.
