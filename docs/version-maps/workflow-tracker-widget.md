# version-map.md

## Feature: Workflow Tracker Widget

### V1 — Foundation
_Not in scope. This feature does not exist in V1._
_The canvas includes Inbox, HTL, and My Tasks as the default operational widgets; workflow status is available only on the Home page card (`WorkflowsCard`)._

### V1.5 — Expansion
_Not in scope. This feature does not exist in V1.5._

### V2 — Full Vision
- [ ] Canvas widget (`w-workflows`) registered in the Marketplace under AIMS OS — Agentic Studio, draggable and configurable like any other system widget
- [ ] Widget header: "2 need attention" amber banner when any workflow is `failed` or has `humanTouchPending: true`
- [ ] Workflow list: each item shows name, status badge (Running / Completed / Failed / Paused), and a colored dot
- [ ] Running workflows: inline progress bar showing `progress` percentage
- [ ] Failed workflows: error message displayed below the workflow name + a "Retry" action button
- [ ] Paused workflows: a "Resume" action button; "Retry" for failed
- [ ] V2-gated `lastOutput`: the last thing the workflow produced, shown as a 1-line summary beneath each workflow (hidden in V1/V1.5)
- [ ] V2-gated `humanTouchPending` badge: "HTL PENDING" chip shown on workflows awaiting a human decision (hidden in V1/V1.5)
- [ ] Count badge in widget tile header: number of workflows in `failed` or `humanTouchPending` state, styled in red
- [ ] "View all 5 →" link expands to a full-queue modal with all workflows visible
- [ ] Retry / Resume buttons show an undo toast (same pattern as HTL and Inbox system widgets)

### Deferred (no version assigned)
_None at this time._

---

## Changelog

### V2 — Full Vision
**Release target:** Q3 2026

**New in this version:**
- Marketplace: `w-workflows` registered as a system widget — draggable, configurable, and available in the widget library
- Widget body: workflow list with status badge, colored dot, and name per item
- Widget body: progress bar for `running` workflows, error text for `failed` workflows
- Widget body: Retry / Resume action buttons with undo toast feedback
- Widget body: `lastOutput` — V2-gated 1-line summary of the last workflow output
- Widget body: `humanTouchPending` — V2-gated "HTL PENDING" badge on workflows awaiting human review
- Widget header: "needs attention" amber banner counting failed + pending HTL workflows
- Widget tile: count badge in red for workflows that need action
- Full-queue modal: "View all 5 →" expands the widget to a scrollable modal

**Updated in this version:**
- `HOME_WORKFLOWS` mock data extended with `lastOutput` (string | null) and `humanTouchPending` (boolean) fields across all 5 workflows

**Removed / not included:**
- _None — this is the complete version._
