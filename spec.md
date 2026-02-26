# Specification

## Summary
**Goal:** Fix the "Failed to create profile" error that occurs during the post-login profile creation flow in ChatApp IC.

**Planned changes:**
- Audit and fix the `registerUser` function in `backend/main.mo` to correctly store a user profile (principal ID + display name) without trapping, ensuring valid Motoko compilation, proper stable variable declarations, and correct return types.
- Fix the frontend profile creation flow in `frontend/src/pages/SetupPage.tsx` and `frontend/src/hooks/useQueries.ts` to correctly call the backend actor with matching Candid argument and return types.
- Add error surfacing on the SetupPage so any failure from `registerUser` is shown as a human-readable inline error message (distinguishing network errors, canister rejections, and validation issues) and logged to the browser console with relevant details.

**User-visible outcome:** After logging in with Internet Identity, users can successfully submit a display name on the SetupPage and be navigated into the main ChatPage. If an error occurs, a clear error message is displayed instead of a silent failure.
