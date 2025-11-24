# Quick Refactoring Checklist

**Use this when refactoring any file**

---

## 📋 Before You Start

- [ ] Read the full plan in `REFACTORING_PLAN.md`
- [ ] Create a feature branch: `git checkout -b refactor/[feature-name]`
- [ ] Note current file line count
- [ ] Identify what phase this work belongs to

---

## 🔧 While Refactoring

### For Components
- [ ] Does it have a single, clear responsibility?
- [ ] Is it easy to understand at a glance?
- [ ] Are props typed with TypeScript interfaces?
- [ ] Is it exported as a named export?
- [ ] Does it follow the naming convention (PascalCase)?
- [ ] If too complex, can it be split into smaller pieces?

### For Hooks
- [ ] Does it start with `use`?
- [ ] Returns an object (not array)?
- [ ] Has a focused, single purpose?
- [ ] No UI/JSX logic inside?
- [ ] Side effects properly wrapped in useEffect?
- [ ] Easy to understand and reuse?

### For Page Files
- [ ] Is it well-organized and easy to navigate?
- [ ] No inline component definitions?
- [ ] Logic extracted to hooks where appropriate?
- [ ] Uses shared components?
- [ ] Focused on orchestration rather than implementation details?

---

## ✅ After Refactoring

- [ ] All existing functionality still works
- [ ] No console errors
- [ ] TypeScript compiles without errors
- [ ] File sizes meet targets
- [ ] Imports are organized
- [ ] Unused imports removed
- [ ] Update `REFACTORING_PLAN.md` progress
- [ ] Commit with clear message
- [ ] Update refactoring log with date and changes

---

## 📝 Commit Message Format

```
refactor(feature): brief description

- Extracted ComponentName from page
- Created useHookName for logic
- Reduced page from XXX to YYY lines

Phase: [1-6]
```

---

## 🎯 Guidelines (Not Hard Limits)

| File Type | Current Issue | Goal |
|-----------|---------------|------|
| Pages     | 800-1200+ lines, hard to navigate | Well-organized, focused, easy to understand |
| Components| Some inline, some too complex | Single responsibility, clear purpose |
| Hooks     | Logic mixed into pages | Extracted, reusable, testable |

**Remember:** Focus on maintainability and readability, not line counts. A well-organized 400-line file is better than four poorly split 100-line files.

---

## 🚀 Common Refactoring Patterns

### Pattern 1: Extract Component
```typescript
// Before
export default function Page() {
  const Card = ({ item }) => <div>...</div>;
  return <Card item={data} />;
}

// After
// components/Card.tsx
export function Card({ item }: { item: Item }) {
  return <div>...</div>;
}

// page.tsx
import { Card } from '@/components/Card';
export default function Page() {
  return <Card item={data} />;
}
```

### Pattern 2: Extract Hook
```typescript
// Before
export default function Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await api.getData();
      setData(result);
      setLoading(false);
    }
    load();
  }, []);

  return <div>...</div>;
}

// After
// hooks/useData.ts
export function useData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await api.getData();
      setData(result);
      setLoading(false);
    }
    load();
  }, []);

  return { data, loading };
}

// page.tsx
import { useData } from '@/hooks/useData';
export default function Page() {
  const { data, loading } = useData();
  return <div>...</div>;
}
```

### Pattern 3: Shared Component
```typescript
// Before (repeated in multiple files)
{loading && (
  <div className="flex justify-center">
    <Loader2 className="animate-spin" />
  </div>
)}

// After
// components/common/LoadingSpinner.tsx
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  return (
    <div className="flex justify-center">
      <Loader2 className={`animate-spin ${sizeClass}`} />
    </div>
  );
}

// Usage
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
{loading && <LoadingSpinner />}
```

---

## ❌ Common Mistakes to Avoid

1. **Don't extract everything** - Some small, page-specific components can stay inline
2. **Don't over-abstract** - 3 uses = extract, 1-2 uses = keep it simple
3. **Don't split for the sake of splitting** - A well-organized longer file beats poorly split shorter files
4. **Don't break functionality** - Test after every change
5. **Don't forget TypeScript** - All props and returns must be typed
6. **Don't skip documentation** - Update this doc as you go
7. **Don't obsess over line counts** - Focus on whether the code is easy to understand and maintain

---

## 🆘 When Stuck

1. Look at existing refactored components for patterns
2. Check `REFACTORING_PLAN.md` for examples
3. Ask: "Does this component have ONE clear job?"
4. If file is still too long, split it more
5. Commit working code often (small commits)

---

**Remember:**
- Perfect is the enemy of done. Aim for better, not perfect.
- Maintainability > Line counts. A well-organized 500-line file is fine if it's easy to understand.
- Refactor when it helps, not because of arbitrary rules.
