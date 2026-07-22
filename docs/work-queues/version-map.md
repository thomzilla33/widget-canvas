## Feature: My Work + My Team — Unified Work Queue Surface

**Prototype**: `src/components/home/WorkQueuesCard.jsx` + `src/components/home/MyTeamCard.jsx`
**Prototype link**: https://thomzilla33.github.io/widget-canvas/home
**ARP ticket**: ARP-928
**Replaces**: MyAttentionCard, MyWorkTodayCard, InboxCard, MyDayCard (all deleted)

---

### V1 — Foundation

Core work queue surface. All data from local mock; no backend joins required.

- [x] WorkQueuesCard: My Work tab + Today's Focus tab with shared tab bar
- [x] My Work tab: event list grouped by tier (Act Now / Critical / Action / Heads-up)
- [x] My Work tab: FilterBar — search by title + filter chips by Studio and Type
- [x] My Work tab: EventCard — expandable row with primary CTA + secondary action buttons
- [x] EventCard: secondary action buttons show matched icons (Eye / XCircle / CheckCircle2 / MessageSquare / ThumbsUp)
- [x] EventCard: Skip hides event for session; fires Undo toast (4s, Undo + dismiss)
- [x] EventCard: Assign button disabled with tooltip "coming in V1.5"
- [x] EventModal: two-column layout (Situation + Decision surface); attestation checkbox required before confirm
- [x] EventModal: intent routing — opening via Reject secondary button pre-selects Reject radio
- [x] EventModal: DecisionSurface varies by event type (Approval, Review, Train, default)
- [x] EscalationModal: escalation reason + notes; fires success toast
- [x] TraceSlideout: read-only audit trail for workflow events
- [x] Today's Focus tab: AI-curated 6-item queue; StartHere card for highest-priority item
- [x] Today's Focus tab: StartHere card shows Train button (disabled, V1.5 tooltip)
- [x] Today's Focus tab: QueueItem expandable rows grouped by tier
- [x] Today's Focus tab: Snooze fires Undo toast (4s); Approve fires Undo toast with resolve sync
- [x] Today's Focus tab: "Review in full" navigates to Attention Room with pre-selected item
- [x] Today's Focus tab: Separator (border-l) before "Review in full" link
- [x] Today's Focus tab: Manager message banner (collapsible)
- [x] My Team card: team roster with per-member tier dot counts + hover tooltips
- [x] My Team card: Take / Nudge / Reassign labeled pill buttons per member
- [x] My Team card: OOO amber chip with return date (replaces invisible status dot)
- [x] My Team card: Nudge disabled for OOO members with tooltip; Reassign highlighted in blue
- [x] My Team card: blocking events banner at top when actnow count > 0
- [x] My Team card: manager-only gate — non-managers see access message
- [x] Cross-surface sync: resolvedStore persists Today's Focus resolutions to Attention Room

### V1.5 — Expansion

Requires UX design review and partial backend wiring.

- [ ] Assign action: opens member picker modal, assigns event to selected team member
- [ ] Train action: opens training feedback flow for AI decision quality
- [ ] MT-03: OOO member action adaptation — Reassign surfaces as primary, Nudge hidden (not just disabled)
- [ ] Skip action: re-surfaces item after 2h session timer (current: hidden for full session)
- [ ] Snooze action: configurable duration (1h / 4h / 24h / tomorrow) instead of fixed 24h
- [ ] "Also in Workflows" chip on events whose sourceWorkflow matches an active workflow

### V2 — Full Vision

Complete work management surface. Requires backend API wiring.

- [ ] MW-04: Tier display unification — single TierBadge component shared across My Work + My Team tabs
- [ ] Action registry: replace `_intent` event object hack with proper action registry (each secondary action has own intent, modal config, confirmation flow)
- [ ] Bulk selection in My Work — select multiple events, batch approve / batch escalate
- [ ] Real assignment: Assign action writes to backend; assigned events appear in assignee's queue
- [ ] Live event counts — My Work badge and tier group counts refresh on WebSocket push
- [ ] Team availability: real OOO data from calendar integration (currently mocked)
- [ ] Saved filters: user can save filter combinations in My Work FilterBar

---

### Deferred (no version assigned)

- Drag-to-reorder events within a tier group — pending design review
- "Snoozed" tab showing items deferred by the user — separate feature, own ARP ticket
- Push notification deep-link routing into specific event — depends on mobile notification infra
- AI-suggested priority reordering within Today's Focus — separate AI feature

---

### Scope toggle

`<ScopeToggle />` at bottom of prototype. V1 = current shipped scope.

| Scope | Elements visible |
|---|---|
| V1 | Core queue, EventModal, EscalationModal, TraceSlideout, toasts |
| V1.5 | + Assign modal, Train flow, OOO action adaptation, configurable snooze |
| V2 | + Action registry, bulk selection, live counts, real assignment |
