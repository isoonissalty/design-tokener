## 2024-05-22 - Missing ARIA labels on icon-only buttons
**Learning:** Icon-only buttons are a common pattern in this application (headers, editors, overlays) but frequently miss `aria-label`, making them inaccessible to screen readers.
**Action:** Always check for `size="icon"` or icon-only content in Buttons and ensure an `aria-label` is present.

## 2024-05-22 - Component Definition Inside Render
**Learning:** Defining components inside another component's render function causes them to remount on every render, losing state and focus. This was observed in `ButtonComponentEditor`.
**Action:** Always define sub-components outside the main component or in a separate file.
