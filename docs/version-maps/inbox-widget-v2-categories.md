# version-map.md

## Feature: Inbox Widget — Category Tabs (V2)

### V1 — Foundation
- [ ] Canvas widget (`w-inbox`) with "All / Needs you / Mentions" filter tabs
- [ ] Unified inbox list: native items from `HOME_INBOX` + pending HITL decisions (human-touch items)
- [ ] Human-touch items: amber "HUMAN-TOUCH" badge + Review / Approve quick actions
- [ ] Mark-read, dismiss, and undo-dismiss on native inbox items
- [ ] Count badge in widget tile header: pending HTL + unread native items
- [ ] "View all" link expands to full-queue modal

### V1.5 — Expansion
_Not in scope. The V1 → V2 gap for this feature is a single filtering enhancement; no intermediate stop is needed._
<!-- No V1.5 — gap between V1 and V2 is small enough to skip -->

### V2 — Full Vision
- [ ] Inbox filter tabs replaced with category-aware tabs: "All / Workflow / Customer / Internal / Needs you"
- [ ] "Workflow" tab: shows items with `origin === 'workflow'` AND HITL human-touch items (agent-generated, needs a human)
- [ ] "Customer" tab: shows items with `origin === 'contact'` (UCP-sourced, clicking → route to UCP)
- [ ] "Internal" tab: shows items with `origin === 'system'` (platform-generated notifications)
- [ ] "Needs you" tab: shows only HITL human-touch items (unchanged from V1)
- [ ] V2 tabs are scope-gated: V1/V1.5 scope shows the original "All / Needs you / Mentions" tabs

### Deferred (no version assigned)
_None at this time._

---

## Changelog

### V1 — Foundation
**Release target:** Q2 2026 (shipped)

**New in this version:**
- Inbox widget: unified list of native items + HITL human-touch rows
- Inbox widget: "All / Needs you / Mentions" filter tabs
- Inbox widget: mark-read, dismiss, undo-dismiss actions
- Inbox widget: count badge (pending HTL + unread items)

**Updated in this version:**
- n/a — this is the first version of the feature

**Removed / not included:**
- Category tabs (Workflow / Customer / Internal) — deferred to V2

---

### V2 — Full Vision
**Release target:** Q3 2026

**New in this version:**
- Inbox widget: "Workflow / Customer / Internal" category tabs alongside "Needs you"
- Inbox widget: filter logic routes by `origin` field on `HOME_INBOX` items (`workflow` / `contact` / `system`)
- Inbox widget: HITL human-touch items also included in the "Workflow" tab (they are workflow/agent-generated)

**Updated in this version:**
- Inbox widget: filter tabs switch from V1 set to V2 set based on scope — controlled by `scopeAtLeast(scope, 'v2')` in `InboxBody`

**Removed / not included:**
- "Mentions" tab — retained only in V1 scope; V2 replaces it with the three category tabs
