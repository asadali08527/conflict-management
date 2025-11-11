# Panelist Dashboard API Integration Summary

## Completed Integration (Phase 1 & 2)

### ✅ Core Infrastructure

#### 1. API Configuration (`src/services/panelist/api.ts`)
- Created axios instance with base URL configuration
- Configured request interceptor to add JWT token from localStorage
- Configured response interceptor for 401 error handling (auto-logout)
- Set timeout to 30 seconds
- Added TypeScript types for API responses and pagination

#### 2. Service Layer (All Completed)
Created 7 service files with all API endpoint implementations:

- **`authService.ts`**: Login, getCurrentUser, changePassword, logout
- **`dashboardService.ts`**: getStats, getRecentActivity, getUpcomingMeetings
- **`caseService.ts`**: getCases, getCaseById, getCaseParties, getCaseDocuments, uploadDocument, addNote, getTimeline
- **`resolutionService.ts`**: submitResolution, updateDraft, getResolutionStatus
- **`meetingService.ts`**: createMeeting, getMeetings, getMeetingById, updateMeeting, cancelMeeting, addMeetingNotes
- **`messageService.ts`**: getMessages, getCaseMessages, sendMessage, markAsRead, getUnreadCount, deleteMessage
- **`profileService.ts`**: getProfile, updateProfile, updateAvailability, updateProfilePicture, updateAccountInfo

#### 3. React Query Hooks (All Completed)
Created 7 custom hooks for data fetching and mutations:

- **`usePanelistAuth.ts`**: Login mutation, current user query, change password, logout
- **`usePanelistDashboard.ts`**: Dashboard stats, recent activity, upcoming meetings (with 30s/60s auto-refetch)
- **`usePanelistCases.ts`**: Cases list, case details with parties/documents/timeline, add note, upload document
- **`usePanelistResolution.ts`**: Submit resolution, update draft, resolution status
- **`usePanelistMeetings.ts`**: Meetings list, create meeting, meeting details, update, cancel, add notes
- **`usePanelistMessages.ts`**: Messages list, send message, mark as read, delete, unread count (30s auto-refetch)
- **`usePanelistProfile.ts`**: Profile data, update profile/availability/picture/account

### ✅ Integrated Pages

#### 1. **PanelistLogin** (COMPLETE)
- **File**: `src/pages/panelist/PanelistLogin.tsx`
- **Changes**:
  - Replaced mock login with `usePanelistAuthQuery` hook
  - Login button uses `loginMutation.mutateAsync()`
  - Shows API error messages in error state
  - Disabled state reflects `loginMutation.isPending`
  - Auto-redirects if already authenticated
- **API Calls**: `POST /api/panelist/auth/login`

#### 2. **PanelistNavbar** (COMPLETE)
- **File**: `src/components/panelist/PanelistNavbar.tsx`
- **Changes**:
  - Integrated `usePanelistMessages` for real unread count
  - Logout uses `logoutMutation.mutate()` instead of context logout
  - Badge on Messages tab shows live unread count
- **API Calls**: `GET /api/panelist/messages/unread-count` (auto-refetch every 30s)

#### 3. **PanelistDashboard** (COMPLETE)
- **File**: `src/pages/panelist/PanelistDashboard.tsx`
- **Changes**:
  - All stat cards use `stats` from `usePanelistDashboard`:
    - Active Cases: `stats.activeCases`
    - Needs Resolution: `stats.casesNeedingResolution`
    - Upcoming Meetings: `stats.upcomingMeetings`
    - Unread Messages: `stats.unreadMessages`
  - Workload capacity card uses `stats.currentCaseLoad`, `stats.maxCases`, `stats.capacityPercentage`
  - Recent activity section uses `activities` array
  - Upcoming meetings section uses `upcomingMeetings` array
  - Added loading skeletons for all sections (`isLoadingStats`, `isLoadingActivity`, `isLoadingMeetings`)
  - Removed all mock data
- **API Calls**:
  - `GET /api/panelist/dashboard/stats` (auto-refetch every 30s)
  - `GET /api/panelist/dashboard/recent-activity?limit=20` (auto-refetch every 60s)
  - `GET /api/panelist/dashboard/upcoming-meetings?limit=10` (auto-refetch every 60s)

---

## 🔄 Remaining Integration (Phase 3)

### Pages to Update

#### 1. **PanelistCases**
- **File**: `src/pages/panelist/PanelistCases.tsx`
- **Hook to use**: `usePanelistCases(params)`
- **Changes needed**:
  - Replace `mockCases` with `cases` from hook
  - Add pagination controls using `pagination` from hook
  - Wire up search input to query params
  - Wire up filter dropdowns (status, type, priority) to query params
  - Add loading state with Skeleton components
  - Add error handling UI
- **Example**:
  ```typescript
  const [params, setParams] = useState<CaseListParams>({
    page: 1,
    limit: 10,
    status: undefined,
    type: undefined,
    priority: undefined,
    search: searchTerm,
  });
  const { cases, pagination, isLoading, error } = usePanelistCases(params);
  ```

#### 2. **PanelistCaseDetail**
- **File**: `src/pages/panelist/PanelistCaseDetail.tsx`
- **Hooks to use**:
  - `usePanelistCase(caseId)` for case data, parties, documents, timeline
  - `usePanelistResolution(caseId)` for resolution submission
- **Changes needed**:
  - Replace `mockCase` with `case` from hook
  - Replace `mockParties` with `parties` from hook
  - Replace `mockDocuments` with `documents` from hook
  - Replace `mockTimeline` with `timeline` from hook
  - Wire up resolution form to `submitResolution` mutation
  - Wire up draft save to `updateDraft` mutation
  - Wire up add note button to `addNote` mutation
  - Wire up upload document to `uploadDocument` mutation
  - Show resolution progress using `progress` from resolution hook
  - Add loading states for each tab
  - Disable submit button when `isSubmitting` is true
- **Example**:
  ```typescript
  const { case: caseData, parties, documents, timeline, addNote, uploadDocument, isLoadingCase } = usePanelistCase(caseId);
  const { submitResolution, updateDraft, progress, isSubmitting } = usePanelistResolution(caseId);

  const handleSubmit = () => {
    submitResolution({
      resolutionStatus,
      resolutionNotes,
      outcome,
      recommendations,
    });
  };
  ```

#### 3. **PanelistMeetings**
- **File**: `src/pages/panelist/PanelistMeetings.tsx`
- **Hooks to use**:
  - `usePanelistMeetings(params)` for meetings list
  - `usePanelistMeeting(meetingId)` for meeting details (if detail page exists)
- **Changes needed**:
  - Replace `mockMeetings` with `meetings` from hook
  - Wire up filter tabs (all/upcoming/past) to query params
  - Wire up "Schedule Meeting" button to `createMeeting` mutation (or navigate to form)
  - Add pagination if needed
  - Add loading skeletons
  - Show `isCreating` state on create button
- **Example**:
  ```typescript
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const params: MeetingListParams = {
    upcoming: filter === 'upcoming',
    past: filter === 'past',
    limit: 10,
  };
  const { meetings, isLoading, createMeeting, isCreating } = usePanelistMeetings(params);
  ```

#### 4. **PanelistMessages**
- **File**: `src/pages/panelist/PanelistMessages.tsx`
- **Hook to use**: `usePanelistMessages(params)`
- **Changes needed**:
  - Replace `mockMessages` with `messages` from hook
  - Wire up search input to query params
  - Wire up "Unread Only" toggle to `unreadOnly` param
  - Wire up message click to `markAsRead` mutation
  - Wire up "Compose Message" button to `sendMessage` mutation
  - Add loading skeletons
  - Show unread count from hook
- **Example**:
  ```typescript
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const params: MessageListParams = {
    search: searchTerm,
    unreadOnly,
    limit: 20,
  };
  const { messages, unreadCount, isLoading, markAsRead, sendMessage } = usePanelistMessages(params);

  const handleMessageClick = (messageId: string) => {
    markAsRead(messageId);
    // navigate to message detail
  };
  ```

#### 5. **PanelistProfile**
- **File**: `src/pages/panelist/PanelistProfile.tsx`
- **Hook to use**: `usePanelistProfile()`
- **Changes needed**:
  - Replace all `panelistInfo` references with `profile.panelist` from hook
  - Replace all `panelistUser` references with `profile.user` from hook
  - Wire up "Save Changes" buttons to appropriate mutations:
    - Personal info → `updateAccountInfo`
    - Bio/certifications/languages → `updateProfile`
    - Availability → `updateAvailability`
    - Profile picture → `updateProfilePicture`
  - Show loading state while `isLoading`
  - Disable buttons when mutations are pending (`isUpdatingProfile`, `isUpdatingAvailability`, etc.)
  - Add success toasts (already handled by hooks)
- **Example**:
  ```typescript
  const { profile, isLoading, updateProfile, updateAvailability, updateAccountInfo, isUpdatingProfile, isUpdatingAvailability } = usePanelistProfile();

  const handleSavePersonalInfo = () => {
    updateAccountInfo({
      firstName: editedFirstName,
      lastName: editedLastName,
      phone: editedPhone,
    });
  };

  const handleUpdateAvailability = () => {
    updateAvailability({
      status: availabilityStatus,
      maxCases,
    });
  };
  ```

---

## 📝 Implementation Pattern for Each Page

### Standard Integration Steps:

1. **Import the hook**:
   ```typescript
   import { usePanelistCases } from '@/hooks/panelist/usePanelistCases';
   ```

2. **Replace mock data with hook**:
   ```typescript
   // Before:
   const mockCases = [...];

   // After:
   const { cases, isLoading, error } = usePanelistCases(params);
   ```

3. **Add loading state**:
   ```typescript
   {isLoading ? (
     <Skeleton className="h-20 w-full" />
   ) : (
     // Render actual data
   )}
   ```

4. **Add error handling** (optional):
   ```typescript
   {error && (
     <Alert variant="destructive">
       <AlertDescription>Failed to load cases. Please try again.</AlertDescription>
     </Alert>
   )}
   ```

5. **Wire up mutations**:
   ```typescript
   const { createMeeting, isCreating } = usePanelistMeetings();

   <Button onClick={() => createMeeting(payload)} disabled={isCreating}>
     {isCreating ? <Loader2 className="animate-spin" /> : 'Create'}
   </Button>
   ```

6. **Remove all mock data** at the end

---

## 🔧 Environment Configuration

Add to `.env` or `.env.local`:
```
VITE_API_BASE_URL=https://your-api-domain.com
```

If not set, it defaults to `https://api.example.com` (see `src/services/panelist/api.ts:3`)

---

## ✨ Key Features Implemented

1. **Automatic Token Management**: JWT token automatically attached to all requests
2. **Auto Logout on 401**: Expired tokens trigger automatic logout and redirect
3. **Toast Notifications**: Success/error toasts on all mutations (using sonner)
4. **Auto Refetch**: Dashboard stats refetch every 30s, messages every 30s, activity/meetings every 60s
5. **Optimistic Updates**: Query cache invalidation after mutations for instant UI updates
6. **Loading States**: Skeleton loaders on all data-fetching components
7. **Error Handling**: Toast messages on API errors with user-friendly messages
8. **Type Safety**: Full TypeScript support across all services and hooks

---

## 🎯 Next Steps for Developer

1. Update `VITE_API_BASE_URL` in environment file
2. Complete Phase 3 integration for remaining 5 pages (follow patterns above)
3. Test all API endpoints with real backend
4. Remove any remaining mock data after testing
5. Add proper error boundaries for production
6. Consider adding retry logic for failed requests
7. Add loading indicators for slow networks
8. Implement proper file upload flow (S3 presigned URLs)

---

## 📚 Documentation References

- API Documentation: `Panelist-dashboard-doc.md`
- React Query Docs: https://tanstack.com/query/latest
- Axios Docs: https://axios-http.com/

---

**Status**: Phase 1 & 2 Complete (Auth, Dashboard, Navbar) ✅
**Remaining**: Phase 3 (Cases, Meetings, Messages, Profile) - Follow patterns above
