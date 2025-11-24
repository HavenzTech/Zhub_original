# Codebase Refactoring Plan

**Project:** Havenz Hub (zhub_original)
**Started:** 2025-11-21
**Status:** 🟡 In Progress
**Goal:** Improve code maintainability, reduce file sizes, and establish better separation of concerns

---

## 📊 Current State Assessment

### Problems Identified
- ❌ **Large page files** - Most pages exceed 800-1200 lines
- ❌ **Inline components** - Components defined inside page files
- ❌ **Repetitive logic** - Similar patterns repeated across pages (loading, error handling)
- ❌ **Mixed concerns** - UI, business logic, and data fetching all in one file
- ❌ **Hard to test** - Large files make unit testing difficult
- ❌ **Poor code reusability** - Logic duplication across pages

### What's Working Well
- ✅ Clean service layer (`bmsApi`, `authService`)
- ✅ Complete TypeScript coverage
- ✅ Consistent patterns across pages
- ✅ Some component extraction already done (modals, tree views)
- ✅ Good documentation in `/docs`

---

## 🎯 Refactoring Goals

1. **Improve maintainability** - Break down overly complex files (focus on readability, not arbitrary line counts)
2. **Extract reusable components** - Move inline components to separate files
3. **Create custom hooks** - Extract data fetching and business logic
4. **Improve code organization** - Feature-based or domain-based structure
5. **Enhance testability** - Smaller, focused units that are easier to test
6. **Reduce duplication** - Share common patterns and logic

---

## 📋 Refactoring Strategy

### Approach: **Incremental Refactoring**
- ✅ No "stop the world" rewrites
- ✅ Refactor as we build new features
- ✅ Improve code when touching existing files
- ✅ One page/feature at a time

### Priority Order
1. **High Traffic Pages** - Pages used most frequently (document-control, dashboard)
2. **Long Files** - Files over 800 lines
3. **Frequently Modified** - Files changed often (high churn)
4. **Low Risk** - Self-contained features first

---

## 🗂️ Target Architecture

### Current Structure
```
app/
├── page.tsx (1000+ lines - dashboard)
├── document-control/page.tsx (1200+ lines)
├── companies/page.tsx (800+ lines)
├── projects/page.tsx
├── departments/page.tsx
└── ...

components/
├── ui/ (shadcn components)
├── FolderTreeView.tsx
├── CreateFolderModal.tsx
└── ...

lib/
├── services/
│   ├── bmsApi.ts
│   └── auth.ts
├── hooks/
│   └── useAuth.ts
└── utils/
```

### Target Structure (Phase 3)
```
app/
├── page.tsx (150 lines max - orchestration only)
├── document-control/page.tsx (200 lines max)
└── ...

features/                          # Feature-based organization
├── documents/
│   ├── components/
│   │   ├── DocumentCard.tsx
│   │   ├── DocumentDetails.tsx
│   │   ├── DocumentList.tsx
│   │   └── UploadModal.tsx
│   ├── hooks/
│   │   └── useDocuments.ts
│   └── utils/
│       └── documentHelpers.ts
├── companies/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── projects/
└── departments/

components/                        # Shared components only
├── ui/ (shadcn)
├── common/
│   ├── LoadingSpinner.tsx
│   ├── ErrorDisplay.tsx
│   ├── EmptyState.tsx
│   └── ConfirmDialog.tsx
└── layout/
    ├── Sidebar.tsx
    └── Header.tsx

lib/
├── services/                      # API clients
├── hooks/                         # Shared hooks
│   ├── useAuth.ts
│   ├── useDataFetching.ts
│   └── usePagination.ts
└── utils/                         # Shared utilities
```

---

## 📅 Phased Refactoring Plan

---

## **PHASE 1: Foundation & Quick Wins**
**Timeline:** Week 1-2
**Goal:** Extract low-hanging fruit, establish patterns

### 1.1 Create Shared UI Components
- [ ] Extract `LoadingSpinner` component
  - Used in: document-control, companies, projects, dashboard
  - Location: `components/common/LoadingSpinner.tsx`

- [ ] Extract `ErrorDisplay` component
  - Used in: all pages with error states
  - Location: `components/common/ErrorDisplay.tsx`

- [ ] Extract `EmptyState` component
  - Used in: document-control, companies (empty lists)
  - Location: `components/common/EmptyState.tsx`

- [ ] Create `ConfirmDialog` component
  - Replace all `window.confirm()` calls
  - Location: `components/common/ConfirmDialog.tsx`

### 1.2 Create Shared Hooks
- [ ] Create `useDataFetching` hook
  - Generic loading/error/data pattern
  - Location: `lib/hooks/useDataFetching.ts`

- [ ] Create `useDocuments` hook
  - Extract document loading/CRUD logic
  - Location: `lib/hooks/useDocuments.ts`

- [ ] Create `useProjects` hook
  - Extract project loading/CRUD logic
  - Location: `lib/hooks/useProjects.ts`

- [ ] Create `useDepartments` hook
  - Extract department loading/CRUD logic
  - Location: `lib/hooks/useDepartments.ts`

### 1.3 Establish Folder Structure
- [ ] Create `features/` directory
- [ ] Create `components/common/` directory
- [ ] Create `components/layout/` directory
- [ ] Update import paths in `tsconfig.json` if needed

**Success Criteria:**
- ✅ 4 shared components created
- ✅ 4 custom hooks created
- ✅ Folder structure established
- ✅ No functionality broken

---

## **PHASE 2: Document Control Page Refactoring**
**Timeline:** Week 2-3
**Goal:** Break down the largest page (1200+ lines)

### 2.1 Extract Components from `app/document-control/page.tsx`

#### Current Inline Components (to extract):
- [ ] `DocumentCard` → `features/documents/components/DocumentCard.tsx`
  - Lines: ~484-550
  - Props: `{ document: Document }`

- [ ] `DocumentDetails` → `features/documents/components/DocumentDetails.tsx`
  - Lines: ~552-754
  - Props: `{ document: Document }`

#### New Components to Create:
- [ ] `DocumentStats` - Stats overview section
  - Lines: ~836-904
  - Location: `features/documents/components/DocumentStats.tsx`

- [ ] `DocumentList` - Grid of document cards
  - Location: `features/documents/components/DocumentList.tsx`
  - Props: `{ documents: Document[], onSelect: (doc) => void }`

- [ ] `UploadDocumentModal` - Extract modal content
  - Lines: ~938-1144
  - Location: `features/documents/components/UploadDocumentModal.tsx`
  - Props: `{ open, onClose, onSubmit, folders, projects, departments }`

### 2.2 Refactor Logic with Hooks
- [ ] Move document CRUD to `useDocuments` hook
- [ ] Move folder CRUD to `useFolders` hook
- [ ] Move upload logic to `useDocumentUpload` hook

### 2.3 Final Structure
```typescript
// app/document-control/page.tsx (target: ~200 lines)
export default function DocumentControlPage() {
  const { documents, loading, error, loadDocuments, deleteDocument } = useDocuments();
  const { folders, loadFolders } = useFolders();
  const { projects } = useProjects();
  const { departments } = useDepartments();

  // Minimal state and orchestration only
  // Render extracted components
}
```

**Success Criteria:**
- ✅ Page significantly simplified (focus on orchestration only)
- ✅ 5+ components extracted
- ✅ 3+ hooks created
- ✅ All functionality works identically
- ✅ Easier to read, navigate, and maintain
- ✅ Well-organized (actual line count will vary based on complexity)

---

## **PHASE 3: Dashboard Page Refactoring**
**Timeline:** Week 3-4
**Goal:** Break down main dashboard page

### 3.1 Extract Dashboard Components
- [ ] `MetricsCards` - Top metrics row
  - Location: `features/dashboard/components/MetricsCards.tsx`

- [ ] `CompanyGrid` - Company overview grid
  - Location: `features/dashboard/components/CompanyGrid.tsx`

- [ ] `RecentUploads` - Recent uploads panel
  - Location: `features/dashboard/components/RecentUploads.tsx`

- [ ] `TodoSidebar` - Right sidebar with todos
  - Location: `features/dashboard/components/TodoSidebar.tsx`

- [ ] `SystemStatus` - System status cards
  - Location: `features/dashboard/components/SystemStatus.tsx`

### 3.2 Create Dashboard Hooks
- [ ] `useDashboardData` - Aggregate all dashboard data
- [ ] `useMetrics` - Calculate metrics

**Success Criteria:**
- ✅ Dashboard page well-organized and maintainable
- ✅ 5+ components extracted
- ✅ 2+ hooks created
- ✅ Easy to understand the overall page structure

---

## **PHASE 4: Companies, Projects, Departments Pages**
**Timeline:** Week 4-5
**Goal:** Apply same pattern to other CRUD pages

### 4.1 Companies Page
- [ ] Extract `CompanyCard` component
- [ ] Extract `CompanyDetails` component
- [ ] Extract `CompanyForm` component
- [ ] Create `useCompanies` hook
- [ ] Create `features/companies/` structure

### 4.2 Projects Page
- [ ] Extract `ProjectCard` component
- [ ] Extract `ProjectDetails` component
- [ ] Extract `ProjectForm` component
- [ ] Hook already created in Phase 1 ✅

### 4.3 Departments Page
- [ ] Extract `DepartmentCard` component
- [ ] Extract `DepartmentDetails` component
- [ ] Extract `DepartmentForm` component
- [ ] Hook already created in Phase 1 ✅

**Success Criteria:**
- ✅ All CRUD pages well-organized and maintainable
- ✅ Consistent component patterns across pages
- ✅ Shared logic in hooks
- ✅ Clear separation of concerns

---

## **PHASE 5: Remaining Pages**
**Timeline:** Week 5-6
**Goal:** Complete refactoring of all pages

### Pages to Refactor:
- [ ] `properties/page.tsx`
- [ ] `z-ai/page.tsx`
- [ ] `users/page.tsx`
- [ ] `virtual-chatbots/page.tsx`
- [ ] `workflows/page.tsx`
- [ ] `bms-hardware/page.tsx`
- [ ] `secure-datacenter/page.tsx`
- [ ] `settings/page.tsx`

**Success Criteria:**
- ✅ All pages follow new structure
- ✅ No page over 300 lines
- ✅ Maximum code reuse

---

## **PHASE 6: Advanced Improvements** (Optional)
**Timeline:** Week 7+
**Goal:** Further optimize architecture

### 6.1 State Management
- [ ] Evaluate React Query / SWR
  - Would eliminate most loading/error logic
  - Built-in caching and refetching
  - Could reduce code by 30-40%

### 6.2 Testing
- [ ] Add unit tests for hooks
- [ ] Add component tests (React Testing Library)
- [ ] Add E2E tests for critical flows (Playwright)

### 6.3 Performance
- [ ] Add React.memo to expensive components
- [ ] Implement virtual scrolling for long lists
- [ ] Code splitting for large pages

### 6.4 Developer Experience
- [ ] Add Storybook for component documentation
- [ ] Create component templates
- [ ] Add pre-commit hooks (Husky + lint-staged)

---

## 📏 Refactoring Guidelines

### File Size Guidelines (Flexible)
- **General principle:** If a file feels hard to navigate or understand, it's probably too long
- **Page files:** Aim for focused, orchestration-only logic (typically 200-400 lines, but can be longer if well-organized)
- **Components:** Keep focused on a single responsibility (typically 100-300 lines depending on complexity)
- **Hooks:** Should be focused and reusable (typically 50-200 lines)
- **When to split:** When you find yourself scrolling excessively or losing context, not based on arbitrary line counts

### Component Rules
1. **Single Responsibility** - Each component does one thing
2. **Props over State** - Prefer controlled components
3. **Composition over Configuration** - Use children, not 50 props
4. **Colocate Related Code** - Keep components near where they're used

### Hook Rules
1. **One concern per hook** - Don't mix data + UI logic
2. **Return objects, not arrays** - `{ data, loading }` not `[data, loading]`
3. **Prefix with `use`** - `useDocuments`, not `documents`
4. **Keep them pure** - No side effects except in useEffect

### File Naming Conventions
- **Components:** PascalCase - `DocumentCard.tsx`
- **Hooks:** camelCase with `use` prefix - `useDocuments.ts`
- **Utils:** camelCase - `formatDate.ts`
- **Types:** camelCase - `document.types.ts`

---

## 🔄 Progress Tracking

### Phase 1: Foundation
- **Status:** 🔴 Not Started
- **Started:** TBD
- **Completed:** TBD
- **Tasks Done:** 0/11

### Phase 2: Document Control
- **Status:** 🔴 Not Started
- **Started:** TBD
- **Completed:** TBD
- **Tasks Done:** 0/10

### Phase 3: Dashboard
- **Status:** 🔴 Not Started
- **Started:** TBD
- **Completed:** TBD
- **Tasks Done:** 0/7

### Phase 4: CRUD Pages
- **Status:** 🔴 Not Started
- **Started:** TBD
- **Completed:** TBD
- **Tasks Done:** 0/12

### Phase 5: Remaining Pages
- **Status:** 🔴 Not Started
- **Started:** TBD
- **Completed:** TBD
- **Tasks Done:** 0/9

### Phase 6: Advanced
- **Status:** 🔴 Not Started
- **Started:** TBD
- **Completed:** TBD
- **Tasks Done:** 0/11

### Overall Progress
**Total Tasks:** 60
**Completed:** 0
**Progress:** 0%

---

## 📝 Refactoring Log

### 2025-11-21
- ✅ Created refactoring plan
- ✅ Identified problem areas
- ✅ Defined target architecture

### [Date] - Phase 1 Started
- Task completed...

### [Date] - Document Control Refactored
- Task completed...

---

## 🎯 Example: Before & After

### Before (Document Control - 1200 lines, hard to navigate)
```typescript
// app/document-control/page.tsx
export default function DocumentControlPage() {
  // 100 lines of state
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // ... 20 more state variables

  // 200 lines of functions
  const loadDocuments = async () => { /* ... */ }
  const handleUpload = async () => { /* ... */ }
  const handleDelete = async () => { /* ... */ }
  // ... 10 more functions

  // 100 lines of inline components
  const DocumentCard = ({ document }) => { /* ... */ }
  const DocumentDetails = ({ document }) => { /* ... */ }

  // 800 lines of JSX
  return (
    <div>
      {/* Massive JSX structure */}
    </div>
  );
}
```

### After (Document Control - Clean and organized)
```typescript
// app/document-control/page.tsx
import { useDocuments } from '@/features/documents/hooks/useDocuments';
import { DocumentList } from '@/features/documents/components/DocumentList';
import { DocumentDetails } from '@/features/documents/components/DocumentDetails';
import { UploadModal } from '@/features/documents/components/UploadModal';

export default function DocumentControlPage() {
  const { documents, loading, error, loadDocuments, deleteDocument } = useDocuments();
  const { folders } = useFolders();
  const { projects } = useProjects();
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="space-y-6">
      <DocumentControlHeader onUploadClick={() => setShowUploadModal(true)} />

      {selectedDocument ? (
        <DocumentDetails
          document={selectedDocument}
          onBack={() => setSelectedDocument(null)}
        />
      ) : (
        <DocumentList
          documents={documents}
          folders={folders}
          onSelect={setSelectedDocument}
          onDelete={deleteDocument}
        />
      )}

      <UploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        folders={folders}
        projects={projects}
      />
    </div>
  );
}
```

---

## 🚨 Important Notes

### Don't Break Functionality
- Test thoroughly after each refactor
- Keep git history clean (small, focused commits)
- Use feature branches for large changes

### When to Refactor
✅ **Good times:**
- Building new features
- Fixing bugs in a file
- Code review finds issues
- Team agrees on improvement

❌ **Bad times:**
- Right before a deadline
- During critical bug fixes
- Without team buy-in
- Just because you can

### Communication
- Update this document as you progress
- Mark tasks complete with dates
- Note any issues or decisions in the log
- Keep team informed of major changes

---

## 🤝 Getting Help

When stuck or conversation resets:
1. Read this document first
2. Check the Progress Tracking section
3. Look at the Refactoring Log for context
4. Review the Example section for patterns

**This document is your source of truth for the refactoring effort.**

---

## 📚 Additional Resources

- [React Component Design Patterns](https://kentcdodds.com/blog/react-component-patterns)
- [Custom Hooks Guide](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Feature-Based Organization](https://dev.to/workingwebsites/feature-based-folder-structure-3meg)
- [React Query Documentation](https://tanstack.com/query/latest)

---

**Last Updated:** 2025-11-21
**Next Review:** After Phase 1 completion
