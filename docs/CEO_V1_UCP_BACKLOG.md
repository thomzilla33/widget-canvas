# CEO V1 — UCP & Studio Product Backlog (waterfall)

Formalizes Mike's V1 feedback into a **sequenced (cascade) activity plan**. Each phase
depends on the ones above it; finish a phase before starting the next. The AIMS *widget*
backlog (`AIMS_WIDGET_DEV_BACKLOG.md`, Phases 1–7) is **complete** and is the foundation
this builds on.

**Legend:** ☐ todo · ◐ partial · ☑ done · ⛔ blocked. **Dep:** dependency. Files are
pointers, not contracts.

---

## The core formalization — Entity vs Global dashboards

Today a dashboard's nature is implicit in `placement.surface`:

- **Entity dashboard** = `surface: 'profile'` → attached to a **profile** (Company/Account,
  Contact/UCP, Employee/UEP, Deal, Case). Rendered inside the entity's tabs (UCPView) and
  scoped to that entity's data. Carries the **locked entity header** + **editable tabs**.
- **Global dashboard** = `surface: 'report' | 'home'` (and the workspace list) → **not**
  attached to any entity. Workspace/team/report rollups. No entity header, no entity tabs.

The product must make this distinction **explicit and first-class** everywhere a dashboard is
created, listed, edited, and consumed — that is Phase U0.

---

## Phase U0 — Formalize Entity vs Global (foundational) ☐
**Goal:** a single, explicit `kind` ∈ {`entity`, `global`} derived from placement, surfaced in
every dashboard touchpoint, so the two worlds never blur.

**Dep:** none (builds on existing placement model).

**Activities**
- ☐ U0.1 Add a derived helper `dashboardKind(dashboard)` → `'entity' | 'global'` (entity ⇐
  `surface==='profile'`) in `src/data/layout.js` or a new `src/data/dashboardKind.js`.
- ☐ U0.2 **NewDashboard** step 1: lead with an explicit **Entity vs Global** choice that then
  reveals the relevant placement sub-form (profile type/scope/tab for entity; collection/home
  scope for global). Re-label copy accordingly.
- ☐ U0.3 **DashboardList** cards: a `kind` chip ("Entity · Contact" vs "Global · Report") + a
  filter toggle (All / Entity / Global), reusing the existing status chips pattern.
- ☐ U0.4 **DashboardViewPage / Canvas**: show the kind in the header description; entity
  dashboards already get the locked header (done) — gate it strictly on `kind==='entity'`.
- ☐ U0.5 Empty/edge copy: a global dashboard never shows the entity header or entity tabs; an
  entity dashboard always does, even with zero widgets.

**Cases covered:** entity-with-specific-record, entity-type-wide (all profiles), report,
home/personal, home/team, dashboard with no placement (treat as global draft).

**Acceptance:** every dashboard surface (create, list, view, canvas) states its kind; the
entity header + tabs appear **iff** `kind==='entity'`; the list filters by kind.

---

## Phase U1 — Tab system hardening ◐
**Goal:** the editable profile tab bar (shipped) becomes durable and complete.

**Dep:** U0.

**Activities**
- ☑ U1.1 Editable tab bar on UCPView — Overview/Activity/Snapshot mandatory; add/remove custom
  tabs; empty-tab state. (commit `9161789`)
- ☐ U1.2 **Persist tabs** beyond in-memory: move tab config into `DashboardsContext` (or a new
  `ProfileConfigContext`) keyed by `profileType` (+ optional entityId override) so edits
  survive reload and reflect on every matching profile.
- ☐ U1.3 **Reorder + rename** tabs (drag, double-click to rename); mandatory tabs reorder but
  can't be renamed/removed.
- ☐ U1.4 **Bind a dashboard to a tab from the tab itself** ("+ Add dashboard to this tab" on an
  empty tab → New Dashboard pre-scoped to that profileType + tab).
- ☐ U1.5 Tab-level visibility by audience/scope (reuse `audiences.js`): hide a tab for roles
  that can't see any of its content.

**Cases covered:** duplicate tab name, deleting the active tab (falls back to Overview),
mandatory protection, a tab with 0/1/many dashboards, per-entity vs per-type tab sets.

**Acceptance:** tab edits persist across reloads; tabs reorder/rename; an empty tab offers a
one-click path to place a dashboard on it.

---

## Phase U2 — Header actions productionization ◐
**Goal:** the locked entity header's actions go from mock affordances to a coherent,
real-feeling action layer.

**Dep:** U0.

**Activities**
- ☑ U2.1 Header on canvas + view + UCP, real entity; Email/SMS/Chat/More actions (mock).
  (commits `f7224d8`, `978061c`)
- ☐ U2.2 Resolve **real per-entity contact fields** (email/phone/address) from the entity
  record instead of the persona fallback (extend `entities` in mock.js with these fields).
- ☐ U2.3 **Email/SMS composers**: templates + variable insertion ({{first_name}} …), a "log to
  Activity" toggle so a sent message appears on the Activity tab.
- ☐ U2.4 **Chat with agent**: scope the canned replies to the entity's real data (recent
  activity, open items) and offer suggested prompts.
- ☐ U2.5 **More menu**: wire "View full profile" everywhere, add "Open in CRM" + "Copy link";
  governance — gate Email/SMS by audience/PBAC.
- ☐ U2.6 Confirm-before-send framing kept (no real send) + a clear "prototype" marker.

**Cases covered:** entity with missing email/phone (disable that action), PII-restricted
viewer, action from canvas (preview) vs live profile.

**Acceptance:** actions read the real entity, compose from templates, and (mock) log to
Activity; restricted viewers don't see disallowed actions.

---

## Phase U3 — AI-suggested widgets & tabs ☐
**Goal:** "here's a source / a UCP — what should I show?" → the system proposes widgets and
tabs the admin can accept.

**Dep:** U0, U1 (tabs), AIMS widget builder (done).

**Activities**
- ☐ U3.1 `suggestWidgets({ source | profileType })` heuristic (deterministic, mock): map a
  source's measures/dimensions + the profile type to a ranked set of recommended widgets
  (reuse `fields.js` `recommendTile`, `dimensionsFor`).
- ☐ U3.2 **"Suggested widgets" panel** in the canvas / WidgetLibrary: cards with "Add" + "Add
  all"; explains *why* each was suggested.
- ☐ U3.3 **AI-suggested tabs**: propose tab sets per profile type (e.g. a dealer Contact →
  Garage/Repair Orders/Appointments) with one-click apply into the tab bar.
- ☐ U3.4 Entry points: a "✨ Suggest" button on the empty canvas, on an empty tab, and in
  NewDashboard after picking a profile type.

**Cases covered:** source with only measures vs only record sets, profile with no connected
source, already-added widgets (dedupe), low-signal sources (graceful "no strong suggestions").

**Acceptance:** picking a source/profile yields ranked, explained suggestions; Add/Add-all
places real widgets; suggested tab sets apply to the tab bar.

---

## Phase U4 — Per-source templates (auto-appear on integration add) ☐
**Goal:** connecting an integration in Data Studio surfaces ready-made dashboard/widget
templates for it.

**Dep:** U3 (suggestions), sources registry (done).

**Activities**
- ☐ U4.1 Define `SOURCE_TEMPLATES[sourceId]` → curated widget/dashboard bundles (mock) for the
  top sources (Salesforce, Zendesk, Stripe, AIMS domains…).
- ☐ U4.2 On a source's `status` flipping to `connected`, show a "Templates for {source}" banner
  in the DataSourceMarketplace + WidgetLibrary with one-click install.
- ☐ U4.3 A "Templates" section in NewDashboard filtered by the connected sources.
- ☐ U4.4 Dedupe against already-installed widgets (templateId, as the marketplace does).

**Cases covered:** newly connected vs long-connected source, source with no template (fallback
to U3 suggestions), multiple sources connected.

**Acceptance:** connecting a source reveals its templates; installing one creates real,
deduped widgets/dashboards.

---

## Phase U5 — Welcome / landing pages per studio ☐
**Goal:** every studio opens with an intro (what you can do + what you've built), like Data
Studio.

**Dep:** U0 (kinds), U1 (tabs) for accurate "what you've built" counts.

**Activities**
- ☐ U5.1 A reusable `<StudioWelcome>` (hero + "what you can do" cards + "what you've built"
  recents + primary CTA).
- ☐ U5.2 Show it as the empty/zero-state of DashboardList, WidgetLibrary, TablesPage, Reports,
  Home — and as a dismissible intro for returning users.
- ☐ U5.3 Per-studio copy + CTAs (Dashboard builder, Widget library, Tables, Reports).
- ☐ U5.4 Richer dashboard cards + filters on the list (kind, owner, freshness, audience).

**Cases covered:** first-run (nothing built) vs returning (recents), each studio's distinct
copy, dismiss/again.

**Acceptance:** each studio has a coherent welcome that adapts to first-run vs returning and
links to its primary action.

---

## Phase U6 — Talk to your dashboard (agentic) ☐
**Goal:** an Amazon-Q-style assistant tuned to a dashboard's / entity's data.

**Dep:** U2 (entity chat groundwork), U3 (data understanding).

**Activities**
- ☐ U6.1 A dashboard-level "Ask" panel (reuse `AgentChatPanel`) seeded with the dashboard's
  widgets/metrics as context.
- ☐ U6.2 Canned, deterministic answers driven by the on-screen widgets (e.g. "why is win rate
  down?" → references the gauge + scope); suggested prompts.
- ☐ U6.3 Entity-network awareness on UCP (the assistant knows related records); general
  dashboards get a synthesized context.
- ☐ U6.4 "Add this answer as a widget" hook into U3 suggestions.

**Cases covered:** dashboard with no widgets, entity vs global context, ambiguous question
(asks to clarify), prototype "canned response" marker.

**Acceptance:** the assistant answers using the current dashboard/entity context and can spin
an answer into a widget suggestion.

---

## Phase U7 — Cross-cutting QA & governance (gate before "V1 done") ☐
**Goal:** the polish/governance pass Mike called out; runs against everything above.

**Dep:** all prior phases (validates them).

**Activities**
- ☐ U7.1 **Light-mode QA** sweep (Mike: text unreadable on white in other studios) — audit
  every new surface (header, tabs, composers, welcome, suggestions) for contrast + token
  switching; fix any `dark:`-only styling.
- ☐ U7.2 **Admin-gated builder**: creation/editing surfaces (canvas, tab edit, suggestions)
  behind an admin role; consumers get read-only.
- ☐ U7.3 **Feedback/escalation → unified workspace**: route flags/HTL from UCP to the Home
  inbox/HTL queue (tie into existing FeedbackContext + PinnedWidgets).
- ☐ U7.4 **A11y pass** on all new components (focus traps, labels, contrast — extend the
  WCAG-AA work already done).
- ☐ U7.5 **Responsive pass** (375 → 2560) on header/tabs/composers/welcome.

**Cases covered:** light + dark, admin vs consumer, mobile → ultrawide, screen-reader.

**Acceptance:** no light-mode contrast failures; non-admins can't edit; feedback reaches the
workspace; AA + responsive hold on every new surface.

---

## Recommended execution order (the cascade)

```
U0  Entity vs Global   ─┬─►  U1 Tabs ─┐
                        │             ├─►  U3 Suggestions ─►  U4 Templates ─┐
                        └─►  U2 Header ┘                                     ├─► U6 Talk-to-dashboard
                                                            U5 Welcome ──────┘
                                                                                     │
                                            U7 Cross-cutting QA  ◄────────────────────┘ (validates all)
```

1. **U0** unblocks everything (the kind distinction is referenced by U1–U7).
2. **U1 + U2** complete the entity surface (tabs + actions).
3. **U3 → U4** build the "intelligent creation" layer (suggestions, then templates).
4. **U5** wraps each studio with a welcome; **U6** adds the conversational layer.
5. **U7** is the final gate — light-mode, admin gating, feedback routing, a11y, responsive —
   run continuously but signed off last.

> Status snapshot: U1.1, U2.1 shipped; U0 and the rest are open. Ship one phase at a time,
> each with build + browser-verify + code-review + deploy (the established workflow).
