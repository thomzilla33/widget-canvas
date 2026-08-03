# version-map.md

## Feature: PA Query Strip — Work Queue

### V1 — Foundation
_Not in scope. This feature does not exist in V1._

### V1.5 — Expansion
_Not in scope. This feature does not exist in V1.5._

### V2 — Full Vision
- [ ] Work Queue list: "✨ Ask PA about this queue…" chip visible above the queue list
- [ ] Work Queue list: clicking the chip expands to a text input with placeholder ("e.g. critical tasks, pending approvals, HTL items…")
- [ ] Work Queue list: submitting a query detects intent (critical / approvals / HTL / asks / all-open) and renders a result card with summary + up to 3 matching items
- [ ] Work Queue list: each result item is clickable and selects that item in the detail pane
- [ ] Work Queue list: edit (pencil) and dismiss (X) controls to refine or clear the query
- [ ] Detail pane: selecting a result item from the strip opens the full item detail on the right
- [ ] Empty state: if no items match the intent, the result card shows "Good news — no [X] right now."

### Deferred (no version assigned)
_None at this time._

---

## Changelog

### V2 — Full Vision
**Release target:** Q3 2026

**New in this version:**
- Work Queue list: PA query chip + expandable input above the queue
- Work Queue list: intent-matched result card (summary + up to 3 items) powered by `wqIntents.js`
- Work Queue list: item click selects the corresponding entry in the detail pane
- Detail pane: receives selection from PA strip result via `handleSelect({ id })`

**Updated in this version:**
- n/a — this is the first version of the feature

**Removed / not included:**
- _None — this is the complete version._
