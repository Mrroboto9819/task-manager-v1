# Task Manager Desktop App - Complete Design System & AI Implementation Guide

> This document serves as a comprehensive reference for AI systems to understand and implement the UI/UX patterns, component structures, and design decisions for this task management application.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Nielsen's Heuristics Implementation](#nielsens-heuristics-implementation)
3. [Color System](#color-system)
4. [Typography System](#typography-system)
5. [Spacing & Layout System](#spacing--layout-system)
6. [Component Library](#component-library)
7. [Card Patterns](#card-patterns)
8. [Modal Patterns](#modal-patterns)
9. [Form Patterns](#form-patterns)
10. [Navigation Patterns](#navigation-patterns)
11. [Feedback Patterns](#feedback-patterns)
12. [Interaction States](#interaction-states)
13. [Accessibility Guidelines](#accessibility-guidelines)
14. [Responsive Behavior](#responsive-behavior)

---

## Design Philosophy

### Core Principles

1. **Clarity over decoration** - Every visual element serves a purpose
2. **Consistency breeds familiarity** - Same patterns repeated throughout
3. **Progressive disclosure** - Show only what's needed, when needed
4. **Reduce cognitive load** - Group related items, use visual hierarchy
5. **Feedback is essential** - Every action has a visible response

### Visual Language

- **Minimal shadows** - Use borders and background colors for depth
- **Rounded corners** - Soft, approachable feel (`radius: 0.5rem`)
- **Teal accent** - Fresh, productive, not aggressive
- **High contrast** - Ensure readability in both modes
- **Whitespace** - Generous spacing for breathing room

---

## Nielsen's Heuristics Implementation

### 1. Visibility of System Status

```
IMPLEMENTATION:
- Loading spinners on async operations
- Progress indicators for multi-step processes
- Toast notifications for action confirmations
- Real-time task count updates in column headers
- Active state highlighting in navigation
- Sync status indicator in titlebar (optional)

VISUAL CUES:
- Spinner: animated circular indicator
- Progress: horizontal bar with percentage
- Toast: slide-in from bottom-right, auto-dismiss
- Counts: badge with number, updates immediately
```

### 2. Match Between System and Real World

```
IMPLEMENTATION:
- Use familiar task management terminology:
  - "Todo" not "Pending Queue"
  - "In Progress" not "Active State"
  - "Done" not "Completed Status"
- Calendar icons for dates
- Flag icons for priority
- User avatars for assignees
- Drag-and-drop mimics physical card movement

LANGUAGE GUIDELINES:
- Button labels: verb + noun ("Add Task", "Delete Sprint")
- Confirmations: question format ("Delete this task?")
- Success messages: past tense ("Task created")
- Error messages: present tense + solution ("Cannot save. Check required fields.")
```

### 3. User Control and Freedom

```
IMPLEMENTATION:
- Undo functionality for destructive actions (3-5 second window)
- Cancel buttons on all forms and modals
- Escape key closes modals
- Click outside modal to close
- Clear filters button when filters are active
- Back navigation where applicable

MODAL ESCAPE ROUTES:
┌─────────────────────────────────────┐
│  [X] ← Close button top-right       │
│                                     │
│  Content                            │
│                                     │
│  [Cancel]  [Confirm] ← Both options │
└─────────────────────────────────────┘
   ↑ Click overlay to close
   ↑ Press Escape to close
```

### 4. Consistency and Standards

```
IMPLEMENTATION:
- Same button styles across all features
- Identical modal structure everywhere
- Consistent icon meanings (trash = delete, pencil = edit)
- Same color meanings (red = destructive, green = success)
- Uniform spacing scale (4px increments)
- Same animation durations (200ms for micro, 300ms for macro)

BUTTON ORDER (left to right):
- Modals: [Cancel] [Primary Action]
- Toolbars: [Secondary...] [Primary]
- Destructive: [Cancel] [Delete] (delete is red, rightmost)
```

### 5. Error Prevention

```
IMPLEMENTATION:
- Confirmation dialogs for destructive actions
- Form validation before submission
- Disabled states for invalid actions
- Required field indicators (*)
- Character limits with counters
- Date pickers prevent invalid dates

CONFIRMATION DIALOG STRUCTURE:
┌─────────────────────────────────────┐
│  ⚠️ Delete Task                     │
│                                     │
│  Are you sure you want to delete    │
│  "Task name here"? This action      │
│  cannot be undone.                  │
│                                     │
│  [Cancel]  [Delete]                 │
└─────────────────────────────────────┘

DELETE BUTTON: bg-destructive (red)
```

### 6. Recognition Rather Than Recall

```
IMPLEMENTATION:
- Visible labels on all icons in navigation
- Tooltips on icon-only buttons
- Recent items / frequently used shown first
- Autocomplete for user assignments
- Visual status indicators (colored dots, not just text)
- Preview of changes before confirming

ICON + LABEL PATTERN:
┌──────────────────┐
│  [Icon]  Label   │  ← Always pair icons with text
└──────────────────┘

ICON-ONLY EXCEPTION (with tooltip):
┌─────┐
│ [X] │  ← Hover shows "Close" tooltip
└─────┘
```

### 7. Flexibility and Efficiency of Use

```
IMPLEMENTATION:
- Keyboard shortcuts for power users
- Quick-add task (single input, Enter to create)
- Drag-and-drop for status changes
- Bulk actions (select multiple, act once)
- Search with filters
- Customizable columns/views

KEYBOARD SHORTCUTS:
- Ctrl/Cmd + N: New task
- Ctrl/Cmd + F: Focus search
- Ctrl/Cmd + /: Show shortcuts
- Escape: Close modal / Clear selection
- Enter: Confirm dialog
- Arrow keys: Navigate tasks
```

### 8. Aesthetic and Minimalist Design

```
IMPLEMENTATION:
- Remove unnecessary borders
- Use whitespace instead of dividers where possible
- Progressive disclosure (show details on expand)
- Hide secondary actions in menus
- One primary action per view
- Muted colors for secondary information

INFORMATION HIERARCHY:
1. Primary: Task title (bold, foreground color)
2. Secondary: Description (normal, foreground color)
3. Tertiary: Metadata (small, muted-foreground color)
4. Quaternary: Timestamps (extra small, muted-foreground)
```

### 9. Help Users Recognize, Diagnose, and Recover from Errors

```
IMPLEMENTATION:
- Inline validation errors (below the field)
- Clear error messages in plain language
- Highlight the problematic field (red border)
- Suggest corrections when possible
- Preserve user input on error
- "Try again" buttons for failed operations

ERROR MESSAGE STRUCTURE:
┌─────────────────────────────────────┐
│  Task Title *                       │
│  ┌─────────────────────────────┐    │
│  │                             │    │ ← Red border
│  └─────────────────────────────┘    │
│  ⚠️ Title is required               │ ← Red text, icon
└─────────────────────────────────────┘
```

### 10. Help and Documentation

```
IMPLEMENTATION:
- Contextual help tooltips (?)
- Empty states with guidance
- Onboarding tour for new users
- Searchable help/documentation
- Keyboard shortcut reference (Ctrl + /)

EMPTY STATE STRUCTURE:
┌─────────────────────────────────────┐
│                                     │
│         [Illustration]              │
│                                     │
│      No tasks yet                   │ ← Title
│                                     │
│   Create your first task to get     │ ← Description
│   started with your project.        │
│                                     │
│        [+ Add Task]                 │ ← CTA
│                                     │
└─────────────────────────────────────┘
```

---

## Color System

### Design Tokens

```css
/* 
 * COLOR PALETTE STRATEGY
 * - 5 colors maximum
 * - 1 primary accent (teal)
 * - 3 neutrals (background, foreground, muted)
 * - Status colors derived from standard conventions
 */
```

### Light Mode Palette

| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `background` | `hsl(210 20% 98%)` | `#F8FAFC` | Page background |
| `foreground` | `hsl(222 47% 11%)` | `#0F172A` | Primary text |
| `card` | `hsl(0 0% 100%)` | `#FFFFFF` | Elevated surfaces |
| `border` | `hsl(214 32% 91%)` | `#E2E8F0` | Dividers, outlines |
| `muted` | `hsl(210 20% 96%)` | `#F1F5F9` | Subtle backgrounds |
| `muted-foreground` | `hsl(215 16% 47%)` | `#64748B` | Secondary text |
| `primary` | `hsl(172 66% 50%)` | `#2DD4BF` | Accent, CTAs |
| `primary-foreground` | `hsl(222 47% 11%)` | `#0F172A` | Text on primary |

### Dark Mode Palette

| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `background` | `hsl(224 71% 4%)` | `#020617` | Page background |
| `foreground` | `hsl(210 20% 98%)` | `#F8FAFC` | Primary text |
| `card` | `hsl(224 50% 8%)` | `#0F172A` | Elevated surfaces |
| `border` | `hsl(224 40% 16%)` | `#1E293B` | Dividers, outlines |
| `muted` | `hsl(224 40% 12%)` | `#1E293B` | Subtle backgrounds |
| `muted-foreground` | `hsl(215 20% 65%)` | `#94A3B8` | Secondary text |
| `primary` | `hsl(172 66% 50%)` | `#2DD4BF` | Same teal accent |
| `primary-foreground` | `hsl(222 47% 11%)` | `#0F172A` | Text on primary |

### Status Colors (Both Modes)

| Status | HSL | Usage | Context |
|--------|-----|-------|---------|
| `success` | `hsl(142 71% 45%)` | Green | Completed, saved, positive |
| `warning` | `hsl(38 92% 50%)` | Amber | Medium priority, caution |
| `info` | `hsl(199 89% 48%)` | Blue | In progress, informational |
| `destructive` | `hsl(0 84% 60%)` | Red | High priority, delete, error |

### Color Application Rules

```
1. BACKGROUNDS
   - Page: var(--background)
   - Cards/Modals: var(--card)
   - Hover states: var(--accent) or var(--muted)
   - Selected: var(--primary) at 10% opacity

2. TEXT
   - Primary content: var(--foreground)
   - Secondary/meta: var(--muted-foreground)
   - Links: var(--primary)
   - On colored backgrounds: matching -foreground token

3. BORDERS
   - Default: var(--border)
   - Focus: var(--ring) / var(--primary)
   - Error: var(--destructive)
   - Success: var(--success)

4. NEVER
   - Use pure black (#000) or pure white (#FFF) for text
   - Mix warm and cool grays
   - Use more than one accent color prominently
   - Apply colors without considering both themes
```

---

## Typography System

### Font Stack

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| `display` | 30px | 700 | 1.2 | Hero headings (rare) |
| `h1` | 24px | 700 | 1.3 | Page titles |
| `h2` | 20px | 600 | 1.35 | Section headings |
| `h3` | 16px | 600 | 1.4 | Card titles |
| `body` | 14px | 400 | 1.5 | Default text |
| `small` | 12px | 400 | 1.4 | Meta, timestamps |
| `tiny` | 11px | 500 | 1.3 | Badges, labels |

### Typography Classes

```html
<!-- Page Title -->
<h1 class="text-2xl font-bold text-foreground">Page Title</h1>

<!-- Section Title -->
<h2 class="text-lg font-semibold text-foreground">Section</h2>

<!-- Card Title -->
<h3 class="text-base font-semibold text-foreground">Card Title</h3>

<!-- Body Text -->
<p class="text-sm text-foreground">Body content here.</p>

<!-- Muted/Secondary Text -->
<p class="text-sm text-muted-foreground">Secondary information.</p>

<!-- Small Meta Text -->
<span class="text-xs text-muted-foreground">Jan 28, 2026</span>

<!-- Badge Text -->
<span class="text-xs font-medium">BADGE</span>
```

### Text Wrapping

```html
<!-- Titles: balance for even line breaks -->
<h1 class="text-balance">Long title that might wrap</h1>

<!-- Body: pretty for optimal readability -->
<p class="text-pretty">Longer paragraph content...</p>

<!-- Truncate single line -->
<span class="truncate">Text that might overflow...</span>

<!-- Clamp to 2 lines -->
<p class="line-clamp-2">Multi-line text that gets cut off...</p>
```

---

## Spacing & Layout System

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `1` | 4px | Icon gaps, tight spacing |
| `2` | 8px | Related elements, inline spacing |
| `3` | 12px | Component internal padding |
| `4` | 16px | Card padding, standard gaps |
| `5` | 20px | Medium sections |
| `6` | 24px | Section gaps, modal padding |
| `8` | 32px | Large section spacing |
| `10` | 40px | Page-level spacing |
| `12` | 48px | Major layout divisions |

### Layout Rules

```
1. FLEXBOX FIRST
   - Use flexbox for all linear layouts
   - Grid only for true 2D layouts (dashboards, galleries)
   - Never use floats

2. GAP OVER MARGIN
   - Use gap-* for spacing between children
   - Use padding for internal spacing
   - Avoid margin except for specific overrides

3. CONSISTENT PADDING
   - Cards: p-4 (16px)
   - Modals: p-6 (24px)
   - Sections: p-4 to p-6
   - Buttons: px-4 py-2

4. HIERARCHY SPACING
   - Within component: gap-2 to gap-3
   - Between components: gap-4
   - Between sections: gap-6 to gap-8
```

### Main Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ TITLEBAR h-10 (40px)                                            │
├─────────┬───────────────────────────────────────────────────────┤
│         │                                                       │
│ SIDEBAR │ MAIN CONTENT                                          │
│ w-64    │ flex-1                                                │
│ (256px) │                                                       │
│         │ ┌───────────────────────────────────────────────────┐ │
│ p-4     │ │ HEADER p-6                                        │ │
│         │ ├───────────────────────────────────────────────────┤ │
│         │ │ CONTENT p-6 overflow-auto                         │ │
│         │ │                                                   │ │
│         │ │                                                   │ │
│         │ │                                                   │ │
│         │ └───────────────────────────────────────────────────┘ │
└─────────┴───────────────────────────────────────────────────────┘

CSS Structure:
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 256px;
  flex-shrink: 0;
  overflow-y: auto;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

---

## Component Library

### Component Hierarchy

```
ATOMS (smallest units)
├── Button
├── Input
├── Badge
├── Avatar
├── Icon
├── Spinner
└── Checkbox

MOLECULES (combined atoms)
├── InputField (Label + Input + Error)
├── SelectField (Label + Select + Error)
├── SearchInput (Icon + Input)
├── UserBadge (Avatar + Name)
├── PriorityBadge (Icon + Label)
└── StatusBadge (Dot + Label)

ORGANISMS (complex components)
├── TaskCard
├── KanbanColumn
├── NavigationItem
├── Modal
├── Toast
├── ConfirmDialog
└── TaskForm

TEMPLATES (page layouts)
├── AppShell (Titlebar + Sidebar + Main)
├── BoardView (Header + Kanban columns)
├── ListView (Header + Table)
└── SettingsView (Sidebar + Form)
```

---

## Card Patterns

### Task Card Structure

```
┌────────────────────────────────────────┐
│ ┌──┐                                   │
│ │••│ Task Title Here                   │  ← Priority dot + Title
│ └──┘                                   │     (flex items-start gap-3)
│                                        │
│ Description text that can span         │  ← Description
│ multiple lines, max 2 lines...         │     (text-sm text-muted-foreground line-clamp-2)
│                                        │
│ ┌─────┐ ┌─────┐ ┌─────┐               │  ← Tags
│ │ Tag │ │ Tag │ │ +2  │               │     (flex flex-wrap gap-1.5)
│ └─────┘ └─────┘ └─────┘               │
│                                        │
│ ┌────────────────┬────────────────┐   │  ← Footer metadata
│ │ [Av] Name      │ [Cal] Jan 28   │   │     (flex items-center justify-between)
│ └────────────────┴────────────────┘   │
│                                        │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░ Blocked ░░░ │  ← Blocked indicator (conditional)
└────────────────────────────────────────┘

CARD CLASSES:
- Container: p-4 bg-card border border-border rounded-lg shadow-sm
- Hover: hover:shadow-md hover:border-primary/30 transition-all duration-200
- Blocked: border-destructive/50 bg-destructive/5
- Dragging: opacity-50 rotate-2 scale-105
```

### Task Card Code Structure

```svelte
<div class="task-card" class:task-card--blocked={task.blocked}>
  <!-- Header: Priority + Title -->
  <div class="flex items-start gap-3 mb-2">
    <span class="priority-dot priority-{task.priority}"></span>
    <h4 class="text-sm font-medium text-foreground line-clamp-1">
      {task.title}
    </h4>
  </div>

  <!-- Description (optional) -->
  {#if task.description}
    <p class="text-sm text-muted-foreground line-clamp-2 mb-3">
      {task.description}
    </p>
  {/if}

  <!-- Tags -->
  {#if task.tags?.length}
    <div class="flex flex-wrap gap-1.5 mb-3">
      {#each task.tags.slice(0, 3) as tag}
        <Badge variant="secondary">{tag}</Badge>
      {/each}
      {#if task.tags.length > 3}
        <Badge variant="outline">+{task.tags.length - 3}</Badge>
      {/if}
    </div>
  {/if}

  <!-- Footer: Assignee + Due Date -->
  <div class="flex items-center justify-between text-xs text-muted-foreground">
    <div class="flex items-center gap-2">
      <Avatar size="sm" src={task.assignee?.avatar} />
      <span>{task.assignee?.name ?? 'Unassigned'}</span>
    </div>
    {#if task.dueDate}
      <div class="flex items-center gap-1">
        <CalendarIcon class="w-3 h-3" />
        <span>{formatDate(task.dueDate)}</span>
      </div>
    {/if}
  </div>

  <!-- Blocked Banner -->
  {#if task.blocked}
    <div class="mt-3 pt-3 border-t border-destructive/30 flex items-center gap-2 text-xs text-destructive">
      <AlertCircle class="w-3 h-3" />
      <span>Blocked</span>
    </div>
  {/if}
</div>
```

### Priority Dot Styles

```css
.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px; /* Align with text baseline */
}

.priority-high {
  background-color: var(--destructive);
}

.priority-medium {
  background-color: var(--warning);
}

.priority-low {
  background-color: var(--muted-foreground);
}

.priority-none {
  background-color: var(--border);
}
```

### Kanban Column Structure

```
┌──────────────────────────────────────┐
│ HEADER                               │
│ ┌──┐                                 │
│ │● │ Status Name              (12)   │  ← Status dot + Name + Count
│ └──┘                                 │
├──────────────────────────────────────┤
│ BODY (scrollable)                    │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Task Card                        │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Task Card                        │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Task Card                        │ │
│ └──────────────────────────────────┘ │
│                                      │
├──────────────────────────────────────┤
│ FOOTER                               │
│ [+ Add Task]                         │  ← Ghost button, full width
└──────────────────────────────────────┘

COLUMN CLASSES:
- Container: flex flex-col min-w-[320px] max-w-[320px] bg-secondary/50 rounded-xl border border-border
- Header: p-4 border-b border-border
- Body: flex-1 p-3 space-y-2 overflow-y-auto min-h-[200px]
- Footer: p-3 border-t border-border
```

### Info Card (Stats/Summary)

```
┌────────────────────────────────────────┐
│                                        │
│  [Icon]                                │  ← Icon in muted circle
│                                        │
│  Label                                 │  ← text-sm text-muted-foreground
│  42                                    │  ← text-3xl font-bold text-foreground
│                                        │
│  ↑ 12% from last week                  │  ← text-xs text-success (optional)
│                                        │
└────────────────────────────────────────┘

CLASSES:
- Container: p-6 bg-card border border-border rounded-xl
- Icon wrapper: w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4
- Icon: w-5 h-5 text-primary
```

### User Card

```
┌────────────────────────────────────────┐
│                                        │
│  ┌──────┐  Name Here                   │  ← Avatar + Name
│  │      │  email@example.com           │     (flex items-center gap-4)
│  │  Av  │                              │
│  │      │  ┌──────┐ ┌──────┐          │  ← Role + Status badges
│  └──────┘  │Admin │ │Active│          │
│            └──────┘ └──────┘          │
│                                        │
│  Tasks: 12  │  Completed: 8           │  ← Stats row
│                                        │
│  [Edit]  [Remove]                      │  ← Actions (right-aligned)
│                                        │
└────────────────────────────────────────┘
```

---

## Modal Patterns

### Modal Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│ OVERLAY (fixed inset-0)                                     │
│ bg-background/80 backdrop-blur-sm z-50                      │
│                                                             │
│    ┌───────────────────────────────────────────────────┐    │
│    │ MODAL CONTAINER                                   │    │
│    │ fixed top-1/2 left-1/2 -translate-x/y-1/2        │    │
│    │ w-full max-w-lg bg-card rounded-xl shadow-xl     │    │
│    │                                                   │    │
│    │ ┌───────────────────────────────────────────┐    │    │
│    │ │ HEADER                               [X]  │    │    │
│    │ │ p-6 pb-0                                  │    │    │
│    │ │                                           │    │    │
│    │ │ Modal Title                               │    │    │
│    │ │ Optional description text here            │    │    │
│    │ └───────────────────────────────────────────┘    │    │
│    │                                                   │    │
│    │ ┌───────────────────────────────────────────┐    │    │
│    │ │ BODY                                      │    │    │
│    │ │ p-6                                       │    │    │
│    │ │                                           │    │    │
│    │ │ Form fields or content here               │    │    │
│    │ │                                           │    │    │
│    │ └───────────────────────────────────────────┘    │    │
│    │                                                   │    │
│    │ ┌───────────────────────────────────────────┐    │    │
│    │ │ FOOTER                                    │    │    │
│    │ │ p-6 pt-0                                  │    │    │
│    │ │                                           │    │    │
│    │ │              [Cancel]  [Primary Action]   │    │    │
│    │ │              ← flex justify-end gap-3     │    │    │
│    │ └───────────────────────────────────────────┘    │    │
│    │                                                   │    │
│    └───────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Modal Sizes

| Size | Max Width | Usage |
|------|-----------|-------|
| `sm` | 384px | Confirmations, simple forms |
| `md` | 512px | Standard forms (default) |
| `lg` | 640px | Complex forms, previews |
| `xl` | 768px | Large content, tables |
| `full` | 90vw | Full-screen dialogs |

### Modal Types

#### 1. Form Modal (Create/Edit)

```
┌────────────────────────────────────────┐
│ Create New Task                   [X]  │
│ Add a task to your project             │
├────────────────────────────────────────┤
│                                        │
│ Title *                                │
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Description                            │
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Priority              Status           │
│ ┌─────────────┐      ┌─────────────┐  │
│ │ Medium    ▼ │      │ Todo      ▼ │  │
│ └─────────────┘      └─────────────┘  │
│                                        │
├────────────────────────────────────────┤
│               [Cancel]  [Create Task]  │
└────────────────────────────────────────┘
```

#### 2. Confirmation Modal (Delete/Destructive)

```
┌────────────────────────────────────────┐
│ ⚠️ Delete Task                    [X]  │
├────────────────────────────────────────┤
│                                        │
│ Are you sure you want to delete        │
│ "Homepage redesign"?                   │
│                                        │
│ This action cannot be undone. All      │
│ associated comments and attachments    │
│ will also be deleted.                  │
│                                        │
├────────────────────────────────────────┤
│               [Cancel]  [Delete]       │
│                          ↑ btn-destructive
└────────────────────────────────────────┘
```

#### 3. Information Modal (View Details)

```
┌────────────────────────────────────────┐
│ Task Details                      [X]  │
├────────────────────────────────────────┤
│                                        │
│ Homepage Redesign                      │  ← h2
│ ┌──────┐ ┌────────┐ ┌──────┐          │
│ │ High │ │In Prog │ │Sprint│          │  ← Badges
│ └──────┘ └────────┘ └──────┘          │
│                                        │
│ Description                            │
│ Redesign the homepage to improve       │
│ conversion rates and user engagement.  │
│                                        │
│ ──────────────────────────────────     │
│                                        │
│ Assignee        Due Date               │
│ [Av] John       Jan 30, 2026           │
│                                        │
│ Created         Updated                │
│ Jan 20, 2026    Jan 28, 2026           │
│                                        │
├────────────────────────────────────────┤
│               [Edit]  [Close]          │
└────────────────────────────────────────┘
```

### Modal Behavior Rules

```
OPENING:
- Trap focus inside modal
- Focus first focusable element
- Prevent body scroll
- Animate: fade in + scale from 95%

CLOSING:
- X button click
- Cancel button click
- Escape key press
- Overlay click (optional, enable for non-form modals)
- Restore focus to trigger element
- Re-enable body scroll

ACCESSIBILITY:
- role="dialog"
- aria-modal="true"
- aria-labelledby points to title
- aria-describedby points to description (if exists)
```

---

## Form Patterns

### Form Field Structure

```
┌────────────────────────────────────────┐
│ Label *                           (i)  │  ← Label + required + help icon
│ ┌────────────────────────────────────┐ │
│ │ Input value                        │ │  ← Input field
│ └────────────────────────────────────┘ │
│ Helper text or character count   0/100 │  ← Helper text (optional)
└────────────────────────────────────────┘

ERROR STATE:
┌────────────────────────────────────────┐
│ Label *                                │
│ ┌────────────────────────────────────┐ │
│ │ Input value                        │ │  ← border-destructive
│ └────────────────────────────────────┘ │
│ ⚠️ Error message here                  │  ← text-destructive
└────────────────────────────────────────┘
```

### Form Layout Patterns

#### Single Column (Default)

```
┌────────────────────────────────────────┐
│ Field 1                                │
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Field 2                                │
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Field 3                                │
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘

gap-4 between fields
```

#### Two Column (Related Fields)

```
┌────────────────────────────────────────┐
│ First Name           Last Name         │
│ ┌─────────────────┐ ┌─────────────────┐│
│ │                 │ │                 ││
│ └─────────────────┘ └─────────────────┘│
│                                        │
│ Email                                  │
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘

grid grid-cols-2 gap-4 for related pairs
```

### Input Types

| Type | Component | Usage |
|------|-----------|-------|
| Text | `<Input />` | Names, titles, short text |
| Textarea | `<Textarea />` | Descriptions, long text |
| Select | `<Select />` | Predefined options |
| Checkbox | `<Checkbox />` | Boolean toggles |
| Radio | `<RadioGroup />` | Single choice from options |
| Date | `<DatePicker />` | Date selection |
| Color | `<ColorPicker />` | Status colors |

### Form Actions Layout

```
┌────────────────────────────────────────┐
│ Form content above...                  │
│                                        │
│ ────────────────────────────────────── │
│                                        │
│              [Cancel]  [Submit]        │  ← flex justify-end gap-3
└────────────────────────────────────────┘

OR for full-width actions:

┌────────────────────────────────────────┐
│ Form content above...                  │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │            Submit                  │ │  ← Full width primary
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │            Cancel                  │ │  ← Full width ghost
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

---

## Navigation Patterns

### Sidebar Navigation

```
┌──────────────────────────────────────┐
│ BRAND SECTION                        │
│ ┌──┐                                 │
│ │● │ Task Manager                    │  ← Logo + App name
│ └──┘                                 │
├──────────────────────────────────────┤
│ PRIMARY NAV                          │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ [□] Board                    (5) │ │  ← Active state
│ └──────────────────────────────────┘ │
│   [☰] List View                      │
│   [👥] Team                          │
│   [📊] Analytics                     │
│                                      │
├──────────────────────────────────────┤
│ SECTION HEADER                       │
│ Sprints                        [+]   │  ← Label + action
│                                      │
│   Sprint 1                           │
│   Sprint 2                           │
│   Sprint 3 (active)                  │  ← Visual indicator
│                                      │
├──────────────────────────────────────┤
│ FOOTER NAV                           │
│   [⚙] Settings                       │
│   [?] Help                           │
└──────────────────────────────────────┘
```

### Navigation Item States

```css
/* Default */
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: var(--sidebar-foreground);
  transition: all 150ms;
}

/* Hover */
.nav-item:hover {
  background: var(--sidebar-accent);
  color: var(--sidebar-accent-foreground);
}

/* Active */
.nav-item--active {
  background: hsl(var(--primary) / 0.1);
  color: var(--primary);
  border-left: 2px solid var(--primary);
}

/* With count badge */
.nav-item__count {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 9999px;
  background: var(--muted);
  color: var(--muted-foreground);
  font-size: 12px;
  font-weight: 500;
}
```

### Breadcrumb Navigation

```
Home  /  Projects  /  Task Manager  /  Sprint 1
  ↑        ↑             ↑              ↑
link     link          link         current (not a link)

<nav class="flex items-center gap-2 text-sm">
  <a href="/" class="text-muted-foreground hover:text-foreground">Home</a>
  <span class="text-muted-foreground">/</span>
  <a href="/projects" class="text-muted-foreground hover:text-foreground">Projects</a>
  <span class="text-muted-foreground">/</span>
  <span class="text-foreground font-medium">Current Page</span>
</nav>
```

---

## Feedback Patterns

### Toast Notifications

```
POSITION: Bottom-right, stacked
DURATION: 3-5 seconds (configurable)
MAX VISIBLE: 3 toasts

┌────────────────────────────────────────┐
│ ✓  Task created successfully      [X]  │  ← Success
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ ⚠  Could not save changes         [X]  │  ← Error
│    Please try again.                   │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ ℹ  3 tasks moved to Done          [X]  │  ← Info
│    [Undo]                              │  ← With action
└────────────────────────────────────────┘

TOAST CLASSES:
- Container: fixed bottom-4 right-4 z-50 flex flex-col gap-2
- Toast: p-4 bg-card border rounded-lg shadow-lg min-w-[300px] animate-in
- Success icon: text-success
- Error icon: text-destructive
- Info icon: text-info
```

### Loading States

```
BUTTON LOADING:
┌─────────────────┐
│ [◠] Saving...   │  ← Spinner + text change
└─────────────────┘

SKELETON LOADING:
┌────────────────────────────────────────┐
│ ████████████████████ ← animate-pulse   │
│ ██████████████████████████████████████ │
│ ██████████████████████████             │
└────────────────────────────────────────┘

OVERLAY LOADING:
┌────────────────────────────────────────┐
│                                        │
│            [◠] Loading...              │
│                                        │
└────────────────────────────────────────┘
bg-background/50 backdrop-blur-sm
```

### Empty States

```
┌────────────────────────────────────────┐
│                                        │
│           ┌─────────────┐              │
│           │             │              │
│           │    [Icon]   │              │  ← Muted icon or illustration
│           │             │              │
│           └─────────────┘              │
│                                        │
│          No tasks yet                  │  ← Title
│                                        │
│   Create your first task to start     │  ← Description
│   organizing your project.            │
│                                        │
│          [+ Create Task]              │  ← CTA button
│                                        │
└────────────────────────────────────────┘

CLASSES:
- Container: flex flex-col items-center justify-center p-12 text-center
- Icon: w-12 h-12 text-muted-foreground mb-4
- Title: text-lg font-semibold text-foreground mb-2
- Description: text-sm text-muted-foreground mb-6 max-w-sm
```

---

## Interaction States

### Button States

| State | Visual Change |
|-------|---------------|
| Default | Base styling |
| Hover | Slightly darker/lighter bg, cursor:pointer |
| Focus | Ring outline (2px, offset 2px) |
| Active | Scale down slightly (98%) |
| Loading | Spinner icon, disabled, text change |
| Disabled | 50% opacity, cursor:not-allowed |

### Input States

| State | Visual Change |
|-------|---------------|
| Default | border-input |
| Hover | border slightly darker |
| Focus | border-primary, ring-2 ring-ring |
| Error | border-destructive, ring-destructive |
| Disabled | bg-muted, cursor:not-allowed |
| Read-only | bg-muted, no focus ring |

### Card States

| State | Visual Change |
|-------|---------------|
| Default | shadow-sm, border-border |
| Hover | shadow-md, border-primary/30 |
| Selected | border-primary, bg-primary/5 |
| Dragging | shadow-lg, rotate-2, scale-105, opacity-80 |
| Drop target | border-dashed border-primary |

---

## Accessibility Guidelines

### Keyboard Navigation

```
TAB: Move forward through focusable elements
SHIFT+TAB: Move backward
ENTER/SPACE: Activate buttons, links
ESCAPE: Close modals, dropdowns, clear selection
ARROW KEYS: Navigate within components (menus, lists)
```

### Focus Management

```
1. Visible focus indicators on all interactive elements
2. Focus trap in modals
3. Return focus to trigger when modal closes
4. Skip links for main content
5. Logical tab order (follows visual order)
```

### ARIA Patterns

```html
<!-- Button with loading state -->
<button aria-busy="true" aria-disabled="true">
  <Spinner /> Saving...
</button>

<!-- Modal dialog -->
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Modal Title</h2>
</div>

<!-- Status badge -->
<span role="status" aria-label="Task status: In Progress">
  In Progress
</span>

<!-- Navigation -->
<nav aria-label="Main navigation">
  <a href="/" aria-current="page">Home</a>
</nav>

<!-- Form field with error -->
<div>
  <label for="email">Email</label>
  <input id="email" aria-invalid="true" aria-describedby="email-error" />
  <span id="email-error" role="alert">Invalid email format</span>
</div>
```

### Color Contrast

```
MINIMUM RATIOS:
- Normal text: 4.5:1
- Large text (18px+ or 14px+ bold): 3:1
- UI components: 3:1

OUR PALETTE CONTRAST:
Light mode:
- foreground on background: 15.8:1 ✓
- muted-foreground on background: 4.6:1 ✓
- primary on background: 3.2:1 ✓ (for UI only)

Dark mode:
- foreground on background: 16.2:1 ✓
- muted-foreground on background: 7.1:1 ✓
- primary on background: 5.8:1 ✓
```

---

## Responsive Behavior

### Breakpoints

| Name | Min Width | Usage |
|------|-----------|-------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Responsive Patterns

```
DESKTOP (default - this is a desktop app)
- Sidebar always visible (w-64)
- Kanban columns horizontal scroll
- Full task cards with all metadata

COMPACT MODE (optional)
- Sidebar collapsed to icons only (w-16)
- Task cards simplified
- Kanban columns stack or paginate
```

### Desktop App Considerations

```
1. Fixed viewport (no responsive breakpoints needed)
2. Titlebar for window controls
3. Native-like scrollbars
4. Keyboard shortcuts prominently featured
5. Right-click context menus
6. Drag and drop is primary interaction
```

---

## Animation Guidelines

### Duration Scale

| Duration | Usage |
|----------|-------|
| 100ms | Micro interactions (hover, active) |
| 150ms | Button state changes |
| 200ms | Component transitions |
| 300ms | Modal open/close |
| 500ms | Page transitions |

### Easing Functions

```css
/* Default - for most transitions */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* Enter - elements appearing */
transition-timing-function: cubic-bezier(0, 0, 0.2, 1);

/* Exit - elements disappearing */
transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
```

### Animation Patterns

```css
/* Fade in + slide up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal entrance */
@keyframes modalIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Skeleton pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## Implementation Checklist

When implementing a new feature or screen, verify:

### Visual
- [ ] Uses correct color tokens (no hardcoded colors)
- [ ] Follows typography scale
- [ ] Consistent spacing (gap-*, p-*, m-*)
- [ ] Proper visual hierarchy
- [ ] Works in both light and dark modes

### Components
- [ ] Uses existing component patterns
- [ ] Consistent button order (Cancel left, Primary right)
- [ ] Proper form validation and error states
- [ ] Loading states for async operations
- [ ] Empty states where needed

### Interaction
- [ ] Hover states on interactive elements
- [ ] Focus states visible
- [ ] Keyboard navigable
- [ ] Appropriate feedback (toasts, inline)
- [ ] Confirmation for destructive actions

### Accessibility
- [ ] Semantic HTML elements
- [ ] ARIA labels where needed
- [ ] Sufficient color contrast
- [ ] Screen reader friendly
- [ ] Focus management in modals

---

*Document version: 1.0*
*Last updated: January 2026*


## Light Mode

| Color | HSL | Hex | Preview
|-----|-----|-----|-----
| **Background** | `hsl(210 20% 98%)` | `#F8FAFC` | 


| **Foreground** | `hsl(222 47% 11%)` | `#0F172A` | 


| **Card** | `hsl(0 0% 100%)` | `#FFFFFF` | 


| **Border** | `hsl(214 32% 91%)` | `#E2E8F0` | 


| **Muted** | `hsl(210 20% 96%)` | `#F1F5F9` | 


| **Muted Foreground** | `hsl(215 16% 47%)` | `#64748B` | 




---

## Dark Mode

| Color | HSL | Hex | Preview
|-----|-----|-----|-----
| **Background** | `hsl(224 71% 4%)` | `#020617` | 


| **Foreground** | `hsl(210 20% 98%)` | `#F8FAFC` | 


| **Card** | `hsl(224 50% 8%)` | `#0A1628` | 


| **Border** | `hsl(224 40% 16%)` | `#1E293B` | 


| **Muted** | `hsl(224 40% 12%)` | `#131C2E` | 


| **Muted Foreground** | `hsl(215 20% 65%)` | `#94A3B8` | 




---

## Accent Colors (Both Modes)

| Color | HSL | Hex | Usage
|-----|-----|-----|-----
| **Primary (Teal)** | `hsl(172 66% 50%)` | `#2DD4BF` | Main CTAs, active states, links
| **Success (Green)** | `hsl(142 71% 45%)` | `#22C55E` | Completed tasks, positive feedback
| **Warning (Amber)** | `hsl(38 92% 50%)` | `#F59E0B` | Medium priority, caution states
| **Info (Blue)** | `hsl(199 89% 48%)` | `#0EA5E9` | In-progress, informational
| **Destructive (Red)** | `hsl(0 84% 60%)` | `#EF4444` | High priority, delete, errors


---

## Visual Summary

```plaintext
LIGHT MODE                          DARK MODE
+---------------------------+       +---------------------------+
|  #F8FAFC (Background)     |       |  #020617 (Background)     |
|  +---------------------+  |       |  +---------------------+  |
|  | #FFFFFF (Card)      |  |       |  | #0A1628 (Card)      |  |
|  |                     |  |       |  |                     |  |
|  | #0F172A (Text)      |  |       |  | #F8FAFC (Text)      |  |
|  | #64748B (Muted)     |  |       |  | #94A3B8 (Muted)     |  |
|  |                     |  |       |  |                     |  |
|  | [#2DD4BF] Primary   |  |       |  | [#2DD4BF] Primary   |  |
|  +---------------------+  |       |  +---------------------+  |
|  #E2E8F0 (Border)         |       |  #1E293B (Border)         |
+---------------------------+       +---------------------------+

STATUS COLORS (Both Modes):
[#22C55E] Success  [#F59E0B] Warning  [#0EA5E9] Info  [#EF4444] Destructive
```

The palette uses a **teal primary** (`#2DD4BF`) which is energetic yet professional, paired with a **deep navy dark mode** and **soft slate light mode** for excellent readability and reduced eye strain.