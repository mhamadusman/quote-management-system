# Frontend AGENTS.md

## 1. Project

Frontend for a **Thunes-style cross-border payments/remittance platform**.

Core UI concepts:

- Quotes
- Corridors
- Revenue
- Monthly Revenue
- TCV
- ATV
- Quote statuses: `draft`, `in_review`, `approved`, `rejected`

Backend API uses `/api/v1`, session authentication, and responses:

```json
{ "message": "...", "data": {} }
```

Errors:

```json
{ "message": "...", "errors": [] }
```

Do not invent business rules or change API contracts. 
---

## 2. Design Direction

Create a **modern, premium fintech dashboard**.

Style should be:

- Clean
- Professional
- Minimal
- Attractive
- Data-focused
- Consistent
- Responsive

Use **Material UI** as the primary styling system.

Use **Poppins or Inter** consistently.

Use subtle glassmorphism where appropriate, rounded surfaces, soft shadows, and restrained visual effects.

Avoid:

- Excessive gradients
- Excessive colors
- Heavy shadows
- Huge spacing
- Unnecessary decoration
- Over-designed UI

Financial metrics such as Cost, Revenue, Monthly Revenue and TCV should use a **consistent visual hierarchy**, not unrelated colors.

---

## 3. MUI Theme

Put reusable global styling in the MUI theme:

- Colors
- Typography
- Font family/weights
- Border radius
- Buttons
- Inputs
- Labels
- Common shadows
- Breakpoints
- Focus/error states

Do not put every component-specific style into the theme.

Use:

```text
MUI Theme
→ Reusable components/styles
→ Component-specific styling only when necessary
```

Repeated styling belongs in the theme or shared `styles/` utilities.

---

## 4. Inputs & Buttons

### Inputs

All inputs must have consistent:

- Height
- Padding
- Border radius
- Floating labels
- Focus state
- Error state
- Disabled state
- Validation message

### Buttons

Use consistent rounded buttons.

Variants:

- Primary
- Secondary
- Outlined
- Destructive

Buttons must have clear hover, focus, disabled, and loading states.

---

## 5. Hover & Animation Rules

Use **Framer Motion** only for useful UI transitions.

Allowed:

- Opacity changes
- Background-color changes
- Border changes
- Shadow changes
- Dropdown/modal appearance
- Page/section transitions

**Never use hover movement.**

Do NOT use:

```text
translateY
translateX
scale
bounce
lift-up effects
```

Buttons, cards, links, and other elements must **not move on hover**.

Animations should be quick and unobtrusive.

---

## 6. Responsive Design

Everything must work on:

- Mobile
- Tablet
- Desktop

On mobile:

- Reduce padding/margins
- Reduce unnecessary font sizes
- Stack layouts
- Make forms single-column
- Handle tables appropriately
- Prevent horizontal overflow
- Keep buttons usable

Do not simply shrink the desktop design.

---

## 7. React Rules

Keep components **small, focused, and reusable**.

Avoid:

- Huge components
- Duplicate code
- Unnecessary state
- Unnecessary effects
- Premature abstractions
- Unnecessary dependencies

Use `useMemo`, `useCallback`, and `React.memo` **only when they provide a real performance benefit**.

Prefer simple, readable React code.

Separate pages, components, hooks, API logic, utilities, styles, and types where appropriate.

---

## 8. UX States

Every API-driven screen should handle:

```text
Loading
Success
Empty
Error
Validation
```

Use appropriate skeletons/loading indicators.

Errors must be user-friendly.

Never expose:

- Stack traces
- SQL errors
- Raw database errors
- Internal implementation details

---

## 9. AI Coding Rules

Before coding:

1. Inspect existing code.
2. Reuse existing components/styles.
3. Follow the existing design system.
4. Keep changes within scope.
5. Do not invent backend functionality.
6. Preserve API contracts.
7. Avoid unnecessary dependencies.
8. Avoid unnecessary refactoring.
9. Keep components small.
10. Extract repetitive patterns into reusable components/styles.
11. Keep styling minimal.
12. Ensure responsive behavior.
13. Do not introduce random colors or typography.
14. Do not add hover movement.

## AI Progress Tracking

After completing a meaningful task, update `AI_PROGRESS.md`.

Keep entries very extremely short.

Include only:
- What was implemented
- Important architectural/design decisions
- Important unfinished work or known issues

Do not document every small code change.

Before starting a task, check `AI_PROGRESS.md` when previous implementation context may affect the task.

## React Component Style

Use simple functional components—no `React.FC`.

Define props with an interface and pass them through a single `props` parameter using dot notation.

```tsx
interface ComponentProps {
  name: string
}

const Component = (props: ComponentProps) => {
  return <div>{props.name}</div>
}
```

Do not destructure props in the function parameters.

## Component Styling Guidelines

Directory Structure: Store all CSS and style modules inside a dedicated /styles folder at the project root. Create component-specific subfolders (e.g., /styles/footer/) to isolate styles for lightweight elements like the footer.

Component Isolation: Keep stylesheet scope limited to its respective component to ensure modularity and low performance overhead.

Inline Documentation: Add a brief, one-line comment directly above any non-obvious or complex CSS rule (e.g., custom grid layouts, dynamic z-indexing, or complex flexbox alignment) explaining its function.

## Services & Error Handling Guidelines

Services Style: Use classes with static functions for all API and business service modules (e.g., `export class AuthService { static async login(...) {} }`).

Error Handling: Always use structured try-catch blocks for asynchronous service calls and API interactions.

Null Safety: Always implement defensive null-safety checks and safe fallbacks for optional or asynchronous data to prevent runtime crashes.


## Reusable Utility Components Guidelines

Extract repeated form fields and UI patterns into memoized utility components (`React.memo`) inside `/src/components/common/` for maximum reusability, consistency, and render performance.

### Final Principle

> **Build a clean, consistent, responsive fintech UI using the minimum necessary code and styling.**