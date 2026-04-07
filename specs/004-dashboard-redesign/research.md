# Research: Dashboard Design Integration

**Phase**: 0 - Research  
**Date**: 2026-04-07

## Overview

Research task to determine implementation approach for dashboard redesign using nyx-kit components and design mockups.

## Design Mockup Analysis

**Source**: `design/anthos_dashboard_rebranded/code.html`

### Key Design Elements

1. **Color Palette** (dark theme):
   - Primary: Purple (#dcb8ff)
   - Secondary: Blue (#9acbfb)
   - Tertiary: Green (#60de87)
   - Error: Red (#ffb4ab)
   - Background: Dark (#0f1419)
   - Surface: Dark gray (#1b2026, #171c22)

2. **Typography**:
   - Headlines: Space Grotesk
   - Body: Inter
   - Mono/Technical: ui-monospace

3. **Layout Components**:
   - Sidebar navigation (fixed left, 64px wide)
   - Top app bar (sticky)
   - Summary metrics row (4 cards)
   - Node grid (responsive: 1/2/3 columns)
   - Activity log panel
   - System health panel

4. **Nyx-Kit Components to Use**:
   - NyxGrid - for layout
   - NyxCard - for node cards and metric cards
   - NyxButton - for actions
   - NyxIcon - for navigation and status
   - NyxBadge - for status indicators
   - NyxProgress - for health panel
   - NyxInput - for search
   - NyxTooltip - for info tooltips
   - NyxTabs - if needed

## Implementation Approach

### Theme Customization

Nyx-kit supports theme customization through CSS custom properties. The design requires:
- Dark mode (primary theme)
- Custom color tokens matching the mockup

### Component Mapping

| Design Element | Nyx-Kit Component |
|----------------|-------------------|
| Sidebar | Custom CSS (no nyx-kit equivalent) |
| Top bar | Custom CSS + NyxInput, NyxIcon |
| Metric cards | NyxCard |
| Node grid | NyxGrid |
| Node cards | NyxCard |
| Activity log | Custom (list component) |
| Health panel | NyxProgress |
| Status badges | NyxBadge |

### Responsive Breakpoints

- Mobile: < 640px (single column)
- Tablet: 640px - 1024px (2 columns)
- Desktop: > 1024px (3+ columns)

## Decisions

| Decision | Rationale |
|----------|-----------|
| Use NyxGrid for layout | Grid component already imported in DashboardView |
| Extend NyxCard with slots | Current NodeCard wraps NyxCard, maintain pattern |
| Custom activity log | No comparable nyx-kit component, build from primitives |
| CSS-based sidebar | Navigation patterns vary, custom implementation needed |

## Alternatives Considered

- Using only nyx-kit primitives: Not sufficient - missing sidebar, activity log
- Building from scratch: Rejects existing nyx-kit investment
- Hybrid approach: Best balance - use nyx-kit where possible, custom for gaps

## Conclusion

Implementation will use nyx-kit as the primary component library with custom CSS for layout elements not covered by nyx-kit components. Theme will be customized via CSS variables to match design mockup.