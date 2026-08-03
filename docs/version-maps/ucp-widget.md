# version-map.md

## Feature: UCP Widget

### V1 — Foundation
- [ ] Canvas widget (`w-ucp`) registered in the Marketplace under Operational, draggable and configurable like any system widget
- [ ] Account list: shows accounts owned by the current user, filtered from `entities` by `owner` and `type === 'Account'`
- [ ] Each row: health dot (active = green / inactive = gray) + account name + status chip + "Open profile →" link navigating to `/ucp/:id`
- [ ] Count badge in widget tile header: number of accounts with `health === 'inactive'` OR status containing "risk", "churn", or "trial"
- [ ] Empty state: "No accounts assigned to you yet"
- [ ] "View all N →" expands to a full-queue modal with all owned accounts visible

### V1.5 — Expansion
- [ ] Action panel: clicking an account row opens a panel with a single NBA action — **Create HTL** — pre-filled with the account name and a default request
- [ ] Create HTL: adds a new item to the HTL queue via WorkQueueContext; item is immediately visible in `w-htl`
- [ ] Panel includes account summary: name, health dot, status, owner
- [ ] Undo toast on HTL creation (same pattern as other system widgets)

### V2 — Full Vision
- [ ] Action panel expanded to three NBA action types: **Run Workflow** (pick from `HOME_WORKFLOWS`, trigger against the account) + **Assign Agent** (pick from `HOME_AGENTS`) + **Create HTL** (carried from V1.5)
- [ ] Advisor cross-reference: if any `HOME_ADVISOR_INSIGHTS` description mentions the account name, a ⚠ amber signal icon appears on that account's row
- [ ] Inline quick actions per row (without opening the panel): **Email** (opens existing `ActionComposer`) + **Create Task** (adds to tasks queue via WorkQueueContext)
- [ ] Full-queue modal: panel access available per account row in the expanded view

### Deferred (no version assigned)
_None at this time._

---

## Changelog

### V1 — Foundation
**Release target:** This sprint (Q3 2026)

**New in this version:**
- Canvas tile: `w-ucp` registered as a system widget — draggable, configurable, available in the Marketplace under Operational
- Canvas tile: account list filtered to the current user's owned accounts with health dot, status chip, and "Open profile →" navigation to UCPView
- Widget header: count badge (amber) showing number of accounts with inactive health or at-risk/churn/trial status
- Canvas tile: empty state ("No accounts assigned to you yet") when no owned accounts exist

**Updated in this version:**
- n/a — first version of this feature

**Removed / not included:**
- Action panel (Run Workflow / Assign Agent / Create HTL) — deferred to V1.5 and V2; adds significant panel state complexity
- Advisor cross-reference signals — deferred to V2
- Inline quick actions (Email, Create Task) — deferred to V2

---

### V1.5 — Expansion
**Release target:** Q3 2026

**New in this version:**
- Action panel: clicking an account row opens a panel with a single NBA action — Create HTL pre-filled with the account context
- Create HTL: HTL item lands in WorkQueueContext and is immediately visible in the `w-htl` widget
- Undo toast: same reversible-action pattern as HTL, Inbox, and Workflow Tracker widgets

**Updated in this version:**
- Account rows: now open the action panel on click; "Open profile →" moves to a secondary link inside the panel

**Removed / not included:**
- Run Workflow and Assign Agent actions — deferred to V2
- Advisor cross-reference — deferred to V2

---

### V2 — Full Vision
**Release target:** Q3 2026

**New in this version:**
- Action panel: Run Workflow (select from active workflows + confirm trigger against account) + Assign Agent (select from active agents)
- Advisor cross-reference: ⚠ amber icon on rows where `HOME_ADVISOR_INSIGHTS` description text contains the account name
- Inline quick actions per row: Email (opens `ActionComposer` pre-filled) + Create Task (adds to WorkQueueContext tasks)

**Updated in this version:**
- Action panel: expanded from single Create HTL to three tabbed NBA action types

**Removed / not included:**
- _None — this is the complete version._
