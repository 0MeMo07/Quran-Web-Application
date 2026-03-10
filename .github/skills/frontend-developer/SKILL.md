---
name: frontend-developer
description: 'Expert frontend developer workflow for modern web applications. Use for: building React/Vue/Angular components, implementing responsive UI, performance optimization (Core Web Vitals), accessibility (WCAG 2.1 AA), TypeScript/Tailwind/Vite projects, state management, code splitting, PWA features, component libraries, testing setup. Triggers: "implement feature", "create component", "optimize performance", "fix accessibility", "build UI", "responsive design", "frontend architecture".'
argument-hint: 'Describe the UI feature, component, or frontend task to implement'
---

# Frontend Developer Skill

Expert React/TypeScript frontend implementation following performance-first, accessibility-inclusive practices.

## When to Use

- Building or refactoring React components (functional, hooks-based)
- Implementing responsive layouts with Tailwind CSS or CSS Modules
- Optimizing Core Web Vitals (LCP, FID/INP, CLS)
- Adding accessibility (ARIA, keyboard nav, screen reader support)
- Setting up state management (Redux Toolkit, Zustand, Context API)
- Code splitting, lazy loading, bundle optimization
- Writing unit/integration tests with Vitest or Jest + Testing Library
- PWA features, service workers, offline support
- TypeScript typing for props, hooks, and API responses

## Procedure

### Step 1 — Understand the Task

1. Read the relevant existing files before making changes (use `read_file` or `grep_search`).
2. Identify the component tree: where does this feature fit? What state does it share?
3. Confirm the framework/styling stack (this project: React + TypeScript + Tailwind + Vite).
4. Check for existing similar components to extend rather than duplicate.

### Step 2 — Design the Component API

- Define TypeScript `interface` or `type` for all props.
- Decide if state is local (`useState`/`useReducer`) or global (Redux slice / Zustand store).
- Plan side effects: which `useEffect` / custom hooks are needed?
- Identify reuse opportunities → extract sub-components or custom hooks.

**Decision — state location:**
| Scope | Tool |
|---|---|
| Single component | `useState` / `useReducer` |
| Sibling components | Lift state / Context |
| Cross-route / persisted | Redux Toolkit slice |

### Step 3 — Implement the Component

```tsx
// Pattern: memo + useCallback for stable references
import { memo, useCallback, useState } from 'react';

interface MyComponentProps {
  title: string;
  onAction: (id: string) => void;
}

export const MyComponent = memo<MyComponentProps>(({ title, onAction }) => {
  const [active, setActive] = useState(false);

  const handleAction = useCallback((id: string) => {
    onAction(id);
  }, [onAction]);

  return (
    <section aria-label={title}>
      {/* semantic HTML + ARIA always */}
    </section>
  );
});
```

Rules:
- Use `memo` for list items and frequently re-rendered components.
- Use `useCallback` for handlers passed as props.
- Use `useMemo` only when computation is genuinely expensive (profile first).
- Prefer named exports for components (aids tree-shaking and debugging).
- Co-locate styles: Tailwind utility classes inline, extract to `cn()` helper for conditional logic.

### Step 4 — Accessibility Checklist

- [ ] Semantic HTML: `<nav>`, `<main>`, `<section>`, `<button>`, `<a>` used correctly.
- [ ] Every interactive element is reachable via `Tab` and operable via `Enter`/`Space`.
- [ ] Images have descriptive `alt` text; decorative images use `alt=""`.
- [ ] Form inputs have associated `<label>` or `aria-label`.
- [ ] Color contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text.
- [ ] Modals/dialogs: focus trap, `role="dialog"`, `aria-modal="true"`, close on `Escape`.
- [ ] Live regions (`aria-live`) for dynamic content updates.
- [ ] `prefers-reduced-motion` respected for animations.

### Step 5 — Performance Optimization

**Lazy load routes and heavy components:**
```tsx
const SurahPage = lazy(() => import('./routes/SurahPage'));
// Wrap in <Suspense fallback={<LoadingSpinner />}>
```

**Avoid layout shift (CLS):**
- Set explicit `width` and `height` on images.
- Reserve space for async-loaded content with skeleton placeholders.

**Bundle optimization:**
- Keep dependencies in `dependencies` vs `devDependencies` correct.
- Avoid barrel files (`index.ts` that re-export everything) in large modules — they defeat tree-shaking.
- Use `vite-bundle-visualizer` to inspect bundle composition.

**Core Web Vitals targets:**
| Metric | Target |
|---|---|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| FCP | < 1.8s |

### Step 6 — Testing

Write tests alongside the component in `__tests__/` or `*.test.tsx`:

```tsx
import { render, screen, userEvent } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

it('calls onAction when activated', async () => {
  const onAction = vi.fn();
  render(<MyComponent title="Test" onAction={onAction} />);
  await userEvent.click(screen.getByRole('button', { name: /activate/i }));
  expect(onAction).toHaveBeenCalledOnce();
});
```

Test checklist:
- [ ] Happy path renders correctly.
- [ ] All interactive elements fire the correct handlers.
- [ ] Loading and error states are covered.
- [ ] Accessibility: query by `role` and `name`, not by class or test-id when possible.

### Step 7 — Deliverable Summary

After implementation, provide:
```
## ✅ Implementation Summary
**Component**: [Name and file path]
**State**: [Local / Redux slice / Context]
**Accessibility**: [WCAG AA checklist items addressed]
**Performance**: [Optimizations applied]
**Tests**: [What is covered]
**Follow-up**: [Known gaps or next steps]
```

## Quality Criteria

Implementation is complete when:
- [ ] TypeScript compiles with zero errors (`tsc --noEmit`).
- [ ] No ESLint errors or warnings in changed files.
- [ ] Component renders correctly on mobile (375px) and desktop (1280px+).
- [ ] Lighthouse accessibility score ≥ 90 for the affected page.
- [ ] Tests pass and cover the critical interaction paths.
- [ ] No `console.error` or unhandled promise rejections.

## Project-Specific Notes (Quran Web Application)

- Stack: React 18 + TypeScript + Tailwind CSS + Vite + Redux Toolkit + React Router
- State slices: `quranSlice`, `searchSlice`, `translationsSlice`, `uiSlice` in `src/store/slices/`
- API layer: `src/api/quranApi.ts` — use existing fetch helpers, do not add raw `fetch` calls elsewhere
- Component conventions: functional components with hooks, co-located in `src/components/`
- Route pages: `src/routes/` — each route is a page-level component
- RTL support: Arabic text requires `dir="rtl"` on container elements and `font-family` set for Arabic script
- Audio: `src/hooks/useAudioPlayer.ts` — use this hook for any audio playback features
