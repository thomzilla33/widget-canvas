# version-map.md

## Feature: WQ Result Widget — Home Copilot

### V1 — Foundation
_Not in scope. This feature does not exist in V1._
_The Home Copilot panel exists in V1 but WQ queries return prose text only (governance/workflow fallbacks). WQ-specific suggestions ("Do I have any open critical tasks?", "Show my pending approvals") are not shown._

### V1.5 — Expansion
_Not in scope. This feature does not exist in V1.5._

### V2 — Full Vision
- [ ] Home Copilot panel: WQ suggestions visible in the "For you" section — "Do I have any open critical tasks?" and "Show my pending approvals"
- [ ] Home Copilot panel: typing or selecting a WQ query detects intent (critical / approvals / HTL / asks / all-open) via `wqIntents.js`
- [ ] Home Copilot panel: WQ queries render a `WQResultCard` inline in the chat thread — summary sentence + up to 4 items with severity dot, type badge, ~Xm estimate, and "Open →" button
- [ ] Home Copilot panel: "Open →" button navigates to Work Queue and pre-selects that item in the detail pane
- [ ] Home Copilot panel: "View all in Work Queue" footer link navigates to Work Queue and closes the Copilot panel
- [ ] Home Copilot panel: empty state — if no items match the intent, the result card shows "Good news — no [X] right now."

### Deferred (no version assigned)
_None at this time._

---

## Changelog

### V2 — Full Vision
**Release target:** Q3 2026

**New in this version:**
- Home Copilot suggestions: WQ-specific suggestions added ("Do I have any open critical tasks?", "Show my pending approvals") — only visible in V2 scope
- Home Copilot chat thread: WQ queries return `WQResultCard` widget instead of prose text — intent-matched via `wqIntents.js`
- Home Copilot chat thread: item "Open →" buttons navigate to Work Queue with item pre-selected in detail pane
- Home Copilot chat thread: "View all in Work Queue" footer navigates and closes the panel

**Updated in this version:**
- Home Copilot suggestions: `buildReply` now gates WQ intent detection behind V2 scope; V1 queries fall through to prose fallbacks

**Removed / not included:**
- _None — this is the complete version._
