# MyAttentionCard — Version Map

**Feature**: Unified Attention Hub (replaces MyWorkTodayCard + InboxCard)
**Prototype**: `src/components/home/MyAttentionCard.jsx` + `attention/`

---

## V1 — Foundation

Core user journey. No cross-system joins required.

- [x] 4-tab hub: All / Tasks / Messages / Approvals with live counts
- [x] Badge on card header (total urgent items)
- [x] ErrorRow — inline Retry button, red left border
- [x] ApprovalRow — Approve + Decline inline, amber left border
- [x] InboxActionRow — Grant access / Remap widget inline CTAs, blue left border
- [x] InboxRow — archive on hover, read/unread opacity state
- [x] TaskRow — complete checkbox, due date with urgency color
- [x] Detail modal for all item types (actor, body, meta chips, error banner)
- [x] Undo toast (4 s, dismiss only)
- [x] Show more / "+N more" pagination (ROW_LIMIT = 8)
- [x] Empty state per tab (CheckCircle2 + "All clear")
- [x] Mobile: horizontal-scroll tab bar + quick actions row
- [x] Mobile: Approval buttons stacked below text

## V1.5 — Cross-Linking Expansion

Requires backend join: inbox items ↔ workflows data.

- [ ] "Also in Workflows" chip on inbox rows whose `meta.source` matches an active workflow
- [ ] Related-entity cross-links on rows (`related.label` clickable)
- [ ] Related-entity cross-link inside detail modal

## V2 — Full Vision

Complete attention management surface.

- [ ] Bulk selection — per-row checkbox, select-all
- [ ] Batch approve / batch decline on selected items
- [ ] Snooze / defer — resurface item after N hours (dropdown: 1h / 4h / tomorrow)
- [ ] Sort within tab — by urgency, source, date
- [ ] AI-suggested priority reordering (badge: "AI sorted")
- [ ] Notification preference shortcut from card header (gear icon → frequency, channels)

---

## Deferred (no version assigned)

- Drag-to-reorder within a tab — pending design review
- Push notification deep-link from mobile — depends on mobile notification infra
- Snooze history / "snoozed" tab — out of V2 scope, separate feature

---

## Scope Toggle

Toggle lives at the bottom-right corner of the prototype (`<ScopeToggle />`).
Switching to V1.5 reveals cross-links. Switching to V2 reveals bulk selection UI.

| Scope | Elements visible |
|---|---|
| V1 | Core rows, modal, tabs, toast |
| V1.5 | + "Also in Workflows" chip + related links |
| V2 | + Bulk select checkboxes + batch action bar |
