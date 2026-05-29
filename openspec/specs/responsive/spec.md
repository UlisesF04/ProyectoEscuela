# responsive Specification

## Purpose
TBD - created by archiving change c-13-frontend-redesign. Update Purpose after archive.
## Requirements
### Requirement: Sidebar responsive behavior
The sidebar SHALL have 3 breakpoint behaviors:
- **Desktop (≥1024px)**: Fixed 280px sidebar with icon+text, always visible
- **Tablet (768-1023px)**: Collapsed to 64px rail with icons only, expandable on hover/tap
- **Mobile (<768px)**: Hidden by default, toggled via hamburger icon as overlay drawer

#### Scenario: Desktop sidebar shows full labels
- **WHEN** viewport width ≥ 1024px
- **THEN** sidebar SHALL be 280px wide showing both icon and text labels

#### Scenario: Mobile sidebar is drawer overlay
- **WHEN** viewport width < 768px and hamburger is clicked
- **THEN** a drawer overlay SHALL slide in from the left with full navigation items

### Requirement: Grids adapt by breakpoint
Content grids SHALL adapt columns by breakpoint:
- Desktop: 3-4 columns (bento grid)
- Tablet: 2 columns
- Mobile: 1 column (full bleed, 16px lateral padding)

#### Scenario: Summary cards reflow on mobile
- **WHEN** viewport width < 768px
- **THEN** a 2x2 grid of summary cards SHALL stack to a single column

### Requirement: Tables become horizontally scrollable on mobile
DataTable SHALL wrap in a horizontally scrollable container on viewports < 768px. Each row SHALL maintain full width with horizontal scroll if column count exceeds viewport.

#### Scenario: DataTable scrolls on mobile
- **WHEN** viewport width < 768px and DataTable has 5+ columns
- **THEN** the table container SHALL show a horizontal scrollbar

### Requirement: Modals become fullscreen on mobile
All Chakra `Modal` components SHALL use `size="full"` on viewports < 768px, showing a close button in the top-left and scrollable content.

#### Scenario: Modal is fullscreen on mobile
- **WHEN** any modal opens and viewport width < 768px
- **THEN** the modal SHALL cover the full screen with a close button at top-left

### Requirement: Touch targets minimum 44px
All interactive elements (buttons, links, toggle inputs, icon buttons) SHALL have a minimum touch target of 44x44px on mobile viewports.

#### Scenario: Button is tappable on mobile
- **WHEN** a button renders at viewport < 768px
- **THEN** its minimum dimensions SHALL be 44x44px

### Requirement: Header adapts with responsive breadcrumb
The dashboard header SHALL show a breadcrumb on desktop (e.g. "Admin / Usuarios") and collapse to showing only the current page title on mobile, with a hamburger toggle button.

#### Scenario: Header shows breadcrumb on desktop
- **WHEN** viewport width ≥ 1024px and page is `/admin/users`
- **THEN** the header SHALL show "Admin / Usuarios" as breadcrumb

#### Scenario: Header hides breadcrumb on mobile
- **WHEN** viewport width < 768px
- **THEN** the header SHALL show only "Usuarios" (current page title) and a hamburger icon

