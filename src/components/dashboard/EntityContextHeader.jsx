import { useState, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, ChevronRight, ChevronDown, Lock, Building2, UserRound, UserCheck, Mail, Phone, MapPin,
  Briefcase, MessageSquare, MoreHorizontal, X, Send, Bot, Copy, ExternalLink, Download,
  User, GitBranch, Shield, TriangleAlert, CircleX, Flag, Calendar, Clock, DollarSign, Zap,
  CheckCircle2, Circle, Info, Database, Activity,
} from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import { PopoverPanel } from '../common/Popover.jsx'
import { actionAllowedFor } from '../../data/audiences.js'
import { useActivity } from '../../state/ActivityContext.jsx'
import { useNotifications } from '../../state/NotificationsContext.jsx'

const HEADER_PROFILES = ['Company', 'Contact', 'Employee', 'Deal', 'Location']
const ENTITY_TO_PROFILE = { Account: 'Company', Contact: 'Contact', Employee: 'Employee', Deal: 'Deal', Case: 'Case', Location: 'Location' }

export function entityHeaderApplies(placement) {
  return placement?.surface === 'profile' && HEADER_PROFILES.includes(placement.profileType)
}
export function profileSupportsHeader(profileType) {
  return HEADER_PROFILES.includes(profileType)
}

const PERSONAS = {
  Contact: {
    kind: 'Contact', icon: UserRound, avatarBg: 'bg-emerald-500',
    name: 'Sarah Mitchell', company: 'Meridian Group', owner: 'James O\'Brien · AE',
    title: 'VP of Operations',
    status: 'Contract Renewal · Active', email: 'sarah.mitchell@meridian.com', phone: '+1 (312) 555-0234', address: 'Chicago, IL',
    primaryAction: 'Email',
    detailFields: [
      { icon: Zap,        label: 'Next Best Action',  value: 'Review call insights · 2 pending' },
      { icon: GitBranch,  label: 'Active Workflow',   value: 'Call Intelligence · processing' },
      { icon: Clock,      label: 'Last Interaction',  value: '3 min ago · Call · 28m' },
      { icon: Bot,        label: 'Last Agent',        value: 'Sentiment Analyzer · 3m ago' },
      { icon: User,       label: 'Pending review',       value: '2 insights awaiting review' },
      // Record fields — Long-term memory (UCP)
      { icon: Clock,        label: 'Last Contact',       value: '3 min ago',                record: true, source: { system: 'Salesforce', model: 'CRM Activity Log v1.4',  syncedAgo: '3m ago'  } },
      { icon: Activity,     label: 'Sentiment',          value: 'At risk ↓',                record: true, source: { system: 'Salesforce', model: 'Sentiment Engine v2.1',  syncedAgo: '3m ago'  } },
      { icon: Briefcase,    label: 'Active Deal',        value: 'Contract Renewal · Q3',    record: true, source: { system: 'HubSpot',    model: 'Deal Sync v1.0',          syncedAgo: '1h ago'  } },
      { icon: Zap,          label: 'Impactful Jobs',     value: '4 active projects',        record: true, source: { system: 'Salesforce', model: 'Account Profile v2.3',    syncedAgo: '1h ago'  } },
      { icon: CheckCircle2, label: 'Open Action Items',  value: '2 pending',                record: true, source: { system: 'HubSpot',    model: 'Activity Sync v1.1',      syncedAgo: '30m ago' } },
    ],
  },
  Company: {
    kind: 'Account', icon: Building2, avatarBg: 'bg-aims-blue',
    name: 'Meridian Health Network', company: '18 facilities · Healthcare', owner: 'Priya Nair · AE',
    status: 'Network sync interrupted · 3 facilities affected', email: 'operations@meridianhealth.org', phone: '+1 (602) 555-0301', address: '4400 N Central Ave, Phoenix, AZ',
    primaryAction: 'Contact account',
    detailFields: [
      { icon: Zap,       label: 'Recommended action', value: 'Review network alerts · 3 pending' },
      { icon: GitBranch, label: 'Active workflow',    value: 'Network Monitor · degraded' },
      { icon: Bot,       label: 'Last agent run',     value: 'Network Agent · 22m ago' },
      { icon: User,      label: 'Pending review',    value: '3 actions awaiting review' },
      { icon: Clock,     label: 'Last sync',         value: '22 min ago · partial',          record: true, source: { system: 'ORI Corporate', model: 'Kernel Sync Log v2.1',        syncedAgo: '22m ago' } },
      { icon: Building2, label: 'Active facilities', value: '15 of 18 fully synced',          record: true, source: { system: 'ORI Corporate', model: 'Network Health v1.8',         syncedAgo: '22m ago' } },
      { icon: Activity,  label: 'Network health',    value: 'Degraded · 3 offline',           record: true, source: { system: 'ORI Corporate', model: 'Kernel Coordinator v2.0',     syncedAgo: '22m ago' } },
      { icon: DollarSign,label: 'ARR',               value: '$4.8M',                          record: true, source: { system: 'Salesforce',    model: 'Revenue Intelligence v1.9',  syncedAgo: '1h ago'  } },
    ],
  },
  Location: {
    kind: 'Location', icon: Building2, avatarBg: 'bg-teal-600',
    name: 'Phoenix Medical Center', company: 'Meridian Health Network · Facility', owner: 'Carlos Reyes · CSM',
    status: 'Network sync interrupted · Phoenix Medical Center', email: 'ops@phx.meridianhealth.org', phone: '+1 (602) 555-0412', address: '1245 E McDowell Rd, Phoenix, AZ',
    primaryAction: 'Contact facility',
    detailFields: [
      { icon: Zap,       label: 'Recommended action', value: 'Review sync incident · 1 pending' },
      { icon: GitBranch, label: 'Active workflow',   value: 'Incident Response · active' },
      { icon: Bot,       label: 'Last agent run',    value: 'Sync Monitor · 8m ago' },
      { icon: User,      label: 'Pending review',    value: '1 action awaiting review' },
      { icon: Clock,     label: 'Last sync',         value: '8 min ago · failed',             record: true, source: { system: 'ORI Corporate', model: 'Kernel Sync Log v2.1',        syncedAgo: '8m ago'  } },
      { icon: Activity,  label: 'Network status',     value: 'Phoenix Medical Center · interrupted',          record: true, source: { system: 'ORI Corporate', model: 'Kernel Health Monitor v1.4', syncedAgo: '8m ago'  } },
      { icon: UserRound, label: 'Staff count',       value: '127 active',                     record: true, source: { system: 'Workday',       model: 'HR People Graph v3.2',        syncedAgo: '6h ago'  } },
      { icon: Building2, label: 'Network',           value: 'Meridian Health Network',        record: true, source: { system: 'ORI Corporate', model: 'Network Registry v1.0',       syncedAgo: '1h ago'  } },
    ],
  },
  Employee: {
    kind: 'Employee', icon: UserCheck, avatarBg: 'bg-violet-500',
    name: 'Marcus Reid', company: 'Meridian Group', owner: 'Olivia Chen · Manager',
    title: 'Senior Account Executive',
    status: 'Performance review · At risk', email: 'marcus.reid@meridian.com',
    phone: '+1 (312) 555-0187', address: 'Chicago, IL',
    primaryAction: 'Review performance',
    detailFields: [
      { icon: Zap,        label: 'Next Best Action',  value: 'Review performance signals · 2 pending' },
      { icon: GitBranch,  label: 'Active Workflow',   value: 'Performance Monitor · flagging' },
      { icon: Clock,      label: 'Last Interaction',  value: '2h ago · Agent flag' },
      { icon: Bot,        label: 'Last Agent',        value: 'Pipeline Analyzer · 2h ago' },
      { icon: User,       label: 'Pending review',       value: '2 actions awaiting review' },
      // Record fields — Workday + Salesforce sources
      { icon: UserRound,    label: 'Manager',          value: 'Olivia Chen',              record: true, source: { system: 'Workday',    model: 'HR People Graph v3.2',     syncedAgo: '12h ago' } },
      { icon: Clock,        label: 'Tenure',           value: '18 months',                record: true, source: { system: 'Workday',    model: 'HR Contract Records v1.1',  syncedAgo: '1d ago'  } },
      { icon: Activity,     label: 'Pipeline',         value: '$240K · 68% of target',    record: true, source: { system: 'Salesforce', model: 'Revenue Intelligence v1.9', syncedAgo: '2h ago'  } },
      { icon: CheckCircle2, label: 'Quota Attainment', value: '68% YTD',                  record: true, source: { system: 'Salesforce', model: 'Quota Tracking v2.1',       syncedAgo: '2h ago'  } },
      { icon: Briefcase,    label: 'Active Deals',     value: '4 open · 2 stalled',       record: true, source: { system: 'Salesforce', model: 'Deal Pipeline Sync v1.8',   syncedAgo: '2h ago'  } },
    ],
  },
  Deal: {
    kind: 'Client (deal)', icon: DollarSign, avatarBg: 'bg-orange-500',
    name: 'Marcus Webb', company: 'Initech', owner: 'Priya Nair',
    status: 'Contract at risk · Aug 29 close', email: 'marcus.webb@initech.com', phone: '+1 (415) 555-0188', address: 'San Francisco, CA',
    primaryAction: 'Email',
    detailFields: [
      { icon: Zap,       label: 'Next Best Action', value: 'Review deal risk signals · 2 pending' },
      { icon: GitBranch, label: 'Active Workflow',  value: 'Sales Velocity · contract at risk' },
      { icon: Clock,     label: 'Last Interaction', value: 'Yesterday' },
      { icon: Bot,       label: 'Last Agent',       value: 'Deal Coach · 4h ago' },
      { icon: User,      label: 'Pending review',      value: '1 action awaiting review' },
      // Record fields — Salesforce + HubSpot sources
      { icon: Calendar,  label: 'Expected Close',   value: 'Aug 29, 2026',                  record: true, source: { system: 'Salesforce', model: 'Deal Pipeline Sync v1.8',  syncedAgo: '2h ago'  } },
      { icon: DollarSign,label: 'Deal Value',       value: '$285,000',                      record: true, source: { system: 'Salesforce', model: 'Deal Revenue Sync v2.0',   syncedAgo: '2h ago'  } },
      { icon: Flag,      label: 'Stage',            value: 'Negotiation',                   record: true, source: { system: 'Salesforce', model: 'Deal Pipeline Sync v1.8',  syncedAgo: '2h ago'  } },
      { icon: UserRound, label: 'Primary Contact',  value: 'Marcus Webb · VP Finance',      record: true, source: { system: 'HubSpot',    model: 'Deal Contact Map v1.2',    syncedAgo: '6h ago'  } },
    ],
  },
}

const AGENTIC_CONTEXT = {
  Contact: {
    workflow:      { name: 'Call Intelligence', status: 'processing' },
    lastAgent:     { name: 'Sentiment Analyzer', ago: '3m ago' },
    nba:           { label: 'Review call insights', confidence: null, primary: true, chipTarget: 'htl' },
    htlPending:    2,
    autoSavedCount: 3,
    memoryLayers: {
      short: { label: 'Call ended 3m ago · 2 pending' },
      mid:   { label: 'Call Intelligence · processing' },
      long:  { label: '4 impact jobs · At risk' },
    },
  },
  Company: {
    workflow:      { name: 'Network Monitor', status: 'degraded' },
    lastAgent:     { name: 'Network Agent', ago: '22m ago' },
    nba:           { label: 'Review network alerts', confidence: null, primary: true, chipTarget: 'htl' },
    htlPending:    3,
    autoSavedCount: 2,
    memoryLayers: {
      short: { label: 'Network sync interrupted 22m ago · 3 pending' },
      mid:   { label: 'Network Monitor · degraded' },
      long:  { label: '18 facilities · $4.8M ARR' },
    },
  },
  Location: {
    workflow:      { name: 'Incident Response', status: 'active' },
    lastAgent:     { name: 'Sync Monitor', ago: '8m ago' },
    nba:           { label: 'Review sync incident', confidence: null, primary: true, chipTarget: 'htl' },
    htlPending:    1,
    autoSavedCount: 1,
    memoryLayers: {
      short: { label: 'Network sync interrupted 8m ago · 1 pending' },
      mid:   { label: 'Incident Response · active' },
      long:  { label: 'Phoenix Medical Center · 127 staff · Meridian Network' },
    },
  },
  Employee: {
    workflow:      { name: 'Performance Monitor', status: 'flagging' },
    lastAgent:     { name: 'Pipeline Analyzer', ago: '2h ago' },
    nba:           { label: 'Review performance signals', confidence: null, primary: true, chipTarget: 'htl' },
    htlPending:    2,
    autoSavedCount: 2,
    memoryLayers: {
      short: { label: 'Performance flagged 2h ago · 2 pending' },
      mid:   { label: 'Performance Monitor · flagging' },
      long:  { label: '18mo tenure · 68% quota' },
    },
  },
  Deal: {
    workflow:      { name: 'Sales Velocity', status: 'contract at risk' },
    lastAgent:     { name: 'Deal Coach', ago: '4h ago' },
    nba:           { label: 'Review deal risk signals', confidence: null, primary: true, chipTarget: 'htl' },
    htlPending:    2,
    autoSavedCount: 2,
    memoryLayers: {
      short: { label: 'Contract delayed 3d · 2 pending' },
      mid:   { label: 'Sales Velocity · contract at risk' },
      long:  { label: '$285K deal · Aug 29 close' },
    },
  },
}

const CHIP_DETAIL = {
  Contact: {
    workflow: {
      steps: [
        { label: 'Call started',           status: 'done',    at: 'Aug 20, 10:19 AM' },
        { label: 'Transcript captured',    status: 'done',    at: 'Aug 20, 10:47 AM' },
        { label: 'Sentiment analysis',     status: 'done',    at: 'Aug 20, 10:47 AM' },
        { label: 'Insight extraction',     status: 'active',  at: null },
        { label: 'Snapshot update',        status: 'pending', at: null },
      ],
      nextTrigger: 'Insights ready for review — awaiting approval before writing to record',
      startedAt: 'Aug 20, 2026',
      owner: 'Call Intelligence (agent)',
    },
    agent: {
      sessionStart: 'Aug 20, 10:47 AM',
      messageCount: 6,
      summary: "Analyzed Sarah Mitchell\'s call transcript. Detected a sentiment shift from Neutral to At Risk, triggered by pricing concerns around the Q3 renewal. Identified 1 new action item committed by the rep.",
      recommendation: "Review the 2 flagged insights before they update Sarah\'s profile. Sentiment and action items require human approval.",
      lastExchange: [
        { role: 'agent', text: "Sentiment dropped to At Risk. Sarah expressed concern about current pricing structure and ROI on 2 of her 4 active projects. Rep committed to sending revised contract terms by Aug 22." },
      ],
    },
    nba: {
      signals: [
        { label: 'Sentiment dropped during call — renewal concern expressed', weight: 'high' },
        { label: 'Rep committed to revised contract terms by Aug 22',        weight: 'high' },
        { label: 'Contract renewal is 38 days away',                         weight: 'medium' },
        { label: '4 active impactful projects — high account value',          weight: 'medium' },
        { label: 'Call duration 28m — strong engagement despite concern',     weight: 'low' },
      ],
      model: 'Call Intelligence v1.2',
      generatedAt: 'Aug 20, 10:47 AM',
      primaryCta: 'review-htl',
    },
    htl: {
      autoSaved: [
        { label: 'Call logged',                detail: 'Aug 20, 2026 · 10:19–10:47 AM · 28 minutes · Synced to Salesforce' },
        { label: 'Last contact date updated',  detail: 'Set to Aug 20, 2026, 10:47 AM — objective data, auto-applied' },
        { label: 'Key topics captured',        detail: '3 topics extracted: Contract terms, Q3 renewal, Project ROI — informational only' },
      ],
      items: [
        {
          id: 'h-contact-call-1',
          title: 'Sentiment drop detected — confirm before updating profile',
          detail: "Sarah expressed concern about current pricing and ROI on 2 of her 4 active projects. Sentiment Engine flagged a shift from Neutral to At Risk. Approving will update her relationship score and flag the account for at-risk outreach.",
          priority: 'High',
          generatedBy: 'Sentiment Analyzer · 3m ago',
        },
        {
          id: 'h-contact-call-2',
          title: 'New action item — rep committed to revised contract terms',
          detail: "During the call, the rep committed to sending Sarah updated contract terms by Friday, Aug 22. Approving will add this to her open action items and create a follow-up reminder for the rep.",
          priority: 'High',
          generatedBy: 'Call Intelligence · 3m ago',
        },
      ],
    },
  },
  Company: {
    workflow: {
      steps: [
        { label: 'Network baseline established', status: 'done', at: 'Aug 1' },
        { label: 'Facility sync monitoring active', status: 'done', at: 'Aug 10' },
        { label: 'Degradation detected — 3 facilities', status: 'active', at: 'Aug 21' },
        { label: 'Incident resolution & recheck', status: 'pending', at: null },
      ],
      nextTrigger: 'Incident response actions awaiting corporate approval before dispatching to facilities',
      startedAt: 'Aug 1, 2026',
      owner: 'Network Agent (agent)',
    },
    agent: {
      sessionStart: 'Aug 21, 7:40 AM',
      messageCount: 9,
      summary: "Detected a network sync disruption affecting 3 of 18 facilities in the Meridian Health Network. PHX-01, SCC-02, and TEM-04 lost contact with the corporate network 22 minutes ago. Root cause traced to last night's maintenance window. A targeted connection restore is ready for approval.",
      recommendation: "Approve the connection restore for the 3 affected facilities — the fix is isolated and non-destructive. ETA to full sync: 8 minutes post-approval.",
      lastExchange: [
        { role: 'agent', text: "3 facilities are offline — PHX-01, SCC-02, TEM-04. Root cause: a configuration mismatch from last night's scheduled maintenance. I've prepared a targeted connection restore. Awaiting your approval before dispatching." },
      ],
    },
    nba: {
      signals: [
        { label: '3 facilities lost network sync 22 minutes ago', weight: 'high' },
        { label: 'Root cause isolated — last night\'s maintenance window', weight: 'high' },
        { label: 'Remediation script ready — no data loss risk', weight: 'medium' },
        { label: 'PHX-01 has 127 active staff — highest impact facility', weight: 'medium' },
        { label: '15 of 18 facilities remain fully operational', weight: 'low' },
      ],
      model: 'Network Agent v2.0',
      generatedAt: 'Aug 21, 8:02 AM',
      primaryCta: 'review-htl',
    },
    htl: {
      autoSaved: [
        { label: 'Sync degradation logged', detail: 'Aug 21, 7:40 AM · 3 facilities lost contact · recorded in network incident log — informational only' },
        { label: 'Root cause identified', detail: 'Configuration mismatch from last night\'s maintenance — auto-diagnosed by Network Agent, no approval needed for logging' },
      ],
      items: [
        {
          id: 'h-meridian-1',
          title: 'Approve connection restore for 3 disconnected facilities',
          detail: "Network Agent has prepared a targeted connection restore for PHX-01, SCC-02, and TEM-04. Approving dispatches the fix to each facility. ETA to full sync: ~8 minutes. No patient data is at risk.",
          priority: 'High',
          generatedBy: 'Network Agent · 22m ago',
        },
        {
          id: 'h-meridian-2',
          title: 'Schedule post-incident review for maintenance window',
          detail: "Network Agent recommends a post-incident review to update the maintenance runbook and prevent recurrence. Approving creates a calendar event for the ops team and flags the incident in the governance log.",
          priority: 'Medium',
          generatedBy: 'Network Agent · 22m ago',
        },
        {
          id: 'h-meridian-3',
          title: 'Notify facility administrators of sync disruption',
          detail: "PHX-01, SCC-02, and TEM-04 facility admins have not been notified of the disruption. Approving sends an automated status update to each facility's designated ops contact.",
          priority: 'Medium',
          generatedBy: 'Network Agent · 22m ago',
        },
      ],
    },
  },
  Location: {
    workflow: {
      steps: [
        { label: 'Facility connected to network', status: 'done', at: 'Mar 1' },
        { label: 'Corporate sync established', status: 'done', at: 'Mar 1' },
        { label: 'Sync failure detected', status: 'active', at: 'Aug 21' },
        { label: 'Remediation & reconnect', status: 'pending', at: null },
      ],
      nextTrigger: 'Connection restore in progress — awaiting facility confirmation',
      startedAt: 'Aug 21, 7:40 AM',
      owner: 'Sync Monitor (agent)',
    },
    agent: {
      sessionStart: 'Aug 21, 7:48 AM',
      messageCount: 5,
      summary: "Phoenix Medical Center lost contact with the Meridian corporate network 8 minutes ago. Sync Monitor identified a configuration mismatch from last night's maintenance as the root cause. 127 staff are active in local mode. No patient data affected. Awaiting the corporate connection restore.",
      recommendation: "No action needed at facility level — the fix is being dispatched from the corporate network. Monitor for reconnection within the next 10 minutes.",
      lastExchange: [
        { role: 'agent', text: "Phoenix Medical Center has been operating in local mode since 7:40 AM. Configuration mismatch confirmed from last night's maintenance. The corporate network has the fix queued — pending their approval. All local workflows are running normally. I'll notify you when sync is restored." },
      ],
    },
    nba: {
      signals: [
        { label: 'Corporate network sync lost 8 minutes ago', weight: 'high' },
        { label: '127 staff operating in local mode', weight: 'high' },
        { label: 'Certificate fix queued by corporate — pending approval', weight: 'medium' },
        { label: 'No patient data affected — local workflows intact', weight: 'low' },
      ],
      model: 'Sync Monitor v1.4',
      generatedAt: 'Aug 21, 7:48 AM',
      primaryCta: 'review-htl',
    },
    htl: {
      autoSaved: [
        { label: 'Sync failure logged', detail: 'Aug 21, 7:40 AM · Lost contact with the corporate network · recorded in facility incident log — informational only' },
      ],
      items: [
        {
          id: 'h-phx-1',
          title: 'Confirm local mode operations are stable',
          detail: "Sync Monitor flagged that 4 workflows are running in local mode and have not yet been reviewed by a facility admin. Approving marks local operations as acknowledged and pauses escalation to the corporate ops team.",
          priority: 'High',
          generatedBy: 'Sync Monitor · 8m ago',
        },
      ],
    },
  },
  Employee: {
    workflow: {
      steps: [
        { label: 'Q3 pipeline baseline set', status: 'done', at: 'Jul 1' },
        { label: 'Month-1 pipeline review', status: 'done', at: 'Jul 28' },
        { label: 'Month-2 pipeline review', status: 'done', at: 'Aug 1' },
        { label: 'Performance flag triggered', status: 'active', at: 'Aug 20' },
        { label: 'Manager notification sent', status: 'pending', at: null },
      ],
      nextTrigger: 'Auto-escalation to HR if no manager action by Aug 27',
      startedAt: 'Jul 1, 2026',
      owner: 'Pipeline Analyzer (agent)',
    },
    agent: {
      sessionStart: 'Aug 20, 8:30 AM',
      messageCount: 7,
      summary: "Detected 3 consecutive months of pipeline below 70% target for Marcus Reid. Quota attainment at 68% YTD. Risk of missing annual target. Manager intervention recommended before Aug 27 escalation.",
      recommendation: "Schedule a performance check-in with Marcus before Aug 27 to assess blockers and build a recovery plan.",
      lastExchange: [
        { role: 'agent', text: "Pipeline has been below 70% target for 3 consecutive months. At current trajectory, Marcus will close Q3 at 65–70% of annual quota. Recommend manager intervention before the automated HR escalation on Aug 27." },
      ],
    },
    nba: {
      signals: [
        { label: 'Pipeline below 70% for 3 consecutive months', weight: 'high' },
        { label: 'Q3 quota attainment at 68% YTD', weight: 'high' },
        { label: 'Automated HR escalation due Aug 27', weight: 'high' },
        { label: 'No manager 1:1 scheduled in past 30 days', weight: 'medium' },
        { label: '4 active deals stalled for 15+ days', weight: 'medium' },
      ],
      model: 'Pipeline Analyzer v2.1',
      generatedAt: 'Aug 20, 8:45 AM',
      primaryCta: 'review-htl',
    },
    htl: {
      autoSaved: [
        { label: 'Performance flag logged', detail: 'Aug 20, 2026, 8:30 AM · 3-month below-target trend recorded in employee record — informational only' },
        { label: 'Manager notification sent', detail: 'Email sent to Olivia Chen at 8:31 AM — objective system alert, no approval needed' },
      ],
      items: [
        {
          id: 'h-emp-perf-1',
          title: 'Pipeline drop — confirm performance intervention',
          detail: 'Marcus Reid has been below 70% pipeline target for 3 consecutive months. Pipeline Analyzer recommends a structured 1:1 and 30-day recovery plan. Approving will create an action item and notify HR. Dismissing delays escalation by 7 days.',
          priority: 'High',
          generatedBy: 'Pipeline Analyzer · 2h ago',
        },
        {
          id: 'h-emp-perf-2',
          title: 'HR escalation scheduled Aug 27 — intervene before deadline',
          detail: 'If no manager action is logged before Aug 27, this case auto-escalates to People Ops per company policy. Approving pauses the escalation clock and marks manager intervention as in progress.',
          priority: 'High',
          generatedBy: 'Pipeline Analyzer · 2h ago',
        },
      ],
    },
  },
  Deal: {
    workflow: {
      steps: [
        { label: 'Opportunity created', status: 'done', at: 'Jul 20' },
        { label: 'Discovery call completed', status: 'done', at: 'Jul 25' },
        { label: 'Proposal delivered', status: 'done', at: 'Aug 5' },
        { label: 'Contract review', status: 'active', at: null },
        { label: 'Signature & close', status: 'pending', at: null },
      ],
      nextTrigger: 'Contract must be signed by Aug 29 to hit Q3 target',
      startedAt: 'Jul 20, 2026',
      owner: 'Deal Coach (agent)',
    },
    agent: {
      sessionStart: 'Aug 18, 7:30 AM',
      messageCount: 15,
      summary: "Tracked Marcus Webb's deal velocity. Contract is in legal review at Initech. Deal Coach flagged a 3-day delay and recommends a nudge call to accelerate signature.",
      recommendation: "Send contract reminder today — delay risk detected.",
      lastExchange: [
        { role: 'agent', text: "Contract entered legal review on Aug 15. 3-day delay vs typical close cycle. Recommend a follow-up to Marcus Webb today to unblock signature before the Q3 deadline." },
      ],
    },
    nba: {
      signals: [
        { label: 'Contract in legal review — 3-day delay detected', weight: 'high' },
        { label: 'Q3 close deadline is Aug 29 — 9 days remaining', weight: 'high' },
        { label: 'Decision maker Marcus Webb last responded Aug 17', weight: 'medium' },
        { label: 'Legal contact added Aug 16 — new stakeholder', weight: 'medium' },
        { label: 'Deal Coach flagged delay vs typical 5-day review cycle', weight: 'low' },
      ],
      model: 'Deal Coach v2.4',
      generatedAt: 'Aug 18, 7:45 AM',
      primaryCta: 'review-htl',
    },
    htl: {
      autoSaved: [
        { label: 'Stage updated to Negotiation', detail: 'Objective CRM state — auto-synced from Salesforce, no approval needed' },
        { label: 'Legal contact logged', detail: 'Initech Legal added Aug 16 · synced from HubSpot Deal Contact Map v1.2' },
      ],
      items: [
        {
          id: 'h-deal-1',
          title: 'Discount approval — 15% off Enterprise tier to unblock close',
          detail: "Deal Coach recommends a 15% discount to accelerate close before the Aug 29 Q3 deadline. This exceeds the 10% auto-approval limit and requires manager review before sending to Initech.",
          priority: 'High',
          generatedBy: 'Deal Coach · 4h ago',
        },
        {
          id: 'h-deal-2',
          title: 'Update expected close date — extend to Sep 5',
          detail: "Given the 3-day delay in legal review, the Aug 29 close is at risk. Deal Coach recommends updating the CRM close date to Sep 5 to preserve pipeline accuracy and avoid a false Q3 commit.",
          priority: 'Medium',
          generatedBy: 'Deal Coach · 4h ago',
        },
      ],
    },
  },
}

const COMPANY_SCENARIOS = {
  health: null, // use default AGENTIC_CONTEXT.Company
  alert: {
    workflow:      { name: 'Incident Response', status: 'active · PHX-01' },
    lastAgent:     { name: 'Sync Monitor', ago: '8m ago' },
    nba:           { label: 'Approve connection restore for Phoenix Medical Center', confidence: null, primary: true, chipTarget: 'htl' },
    htlPending:    1,
    autoSavedCount: 1,
    memoryLayers: {
      short: { label: 'PHX-01 offline 8m ago · 1 action pending' },
      mid:   { label: 'Incident Response · active' },
      long:  { label: 'Phoenix Medical Center · 127 staff · sync interrupted' },
    },
  },
  expansion: {
    workflow:      { name: 'Location Onboarding', status: 'in progress · TEM-07' },
    lastAgent:     { name: 'Network Provisioner', ago: '2h ago' },
    nba:           { label: 'Approve TEM-07 network connection', confidence: null, primary: true, chipTarget: 'htl' },
    htlPending:    2,
    autoSavedCount: 3,
    memoryLayers: {
      short: { label: 'TEM-07 onboarding in progress · 2 pending' },
      mid:   { label: 'Location Onboarding · step 4 of 6' },
      long:  { label: 'Tempe Outpatient Clinic · 62 staff · Q3 launch' },
    },
  },
}

const COMPANY_SCENARIO_CHIPS = {
  health: null, // use default CHIP_DETAIL.Company
  alert: {
    workflow: {
      steps: [
        { label: 'Facility monitoring active',     status: 'done',    at: 'Aug 1'  },
        { label: 'PHX-01 sync failure detected',   status: 'done',    at: 'Aug 21' },
        { label: 'Root cause identified',          status: 'done',    at: 'Aug 21' },
        { label: 'Certificate push dispatched',    status: 'active',  at: null     },
        { label: 'Sync restored & verified',       status: 'pending', at: null     },
      ],
      nextTrigger: 'Connection restore awaiting corporate approval before dispatch to Phoenix Medical Center',
      startedAt: 'Aug 21, 7:40 AM',
      owner: 'Sync Monitor (agent)',
    },
    agent: {
      sessionStart: 'Aug 21, 7:48 AM',
      messageCount: 5,
      summary: "Phoenix Medical Center (ori-phx-01) lost contact with the Meridian corporate kernel 8 minutes ago. Root cause: certificate mismatch from last night's maintenance window. 127 staff are operating on local mode. Certificate fix is ready — awaiting corporate approval.",
      recommendation: "Approve the certificate push now — the fix is isolated and risk-free. All local workflows at PHX-01 are stable.",
      lastExchange: [
        { role: 'agent', text: "Phoenix Medical Center is in local mode. Configuration mismatch confirmed from last night's check. Fix is queued. Approving dispatches it directly to the facility — ETA to sync restore: ~6 minutes." },
      ],
    },
    nba: {
      signals: [
        { label: 'Phoenix Medical Center lost network sync 8 minutes ago', weight: 'high' },
        { label: '127 staff on local mode — highest impact facility',  weight: 'high' },
        { label: 'Certificate fix ready — no data loss risk',          weight: 'medium' },
        { label: '15 of 18 facilities remain fully synced',           weight: 'low' },
      ],
      model: 'Sync Monitor v1.4',
      generatedAt: 'Aug 21, 7:48 AM',
      primaryCta: 'review-htl',
    },
    htl: {
      autoSaved: [
        { label: 'Sync failure logged', detail: 'Aug 21, 7:40 AM · Phoenix Medical Center lost contact with the corporate network — recorded in network incident log, informational only' },
        { label: 'Root cause identified', detail: 'Configuration mismatch — auto-diagnosed by Sync Monitor, no approval needed for logging' },
      ],
      items: [
        {
          id: 'h-meridian-alert-1',
          title: 'Approve connection restore for Phoenix Medical Center',
          detail: "Sync Monitor has a targeted configuration fix ready for Phoenix Medical Center. Approving dispatches the fix from the corporate network directly to the facility. ETA to sync restore: ~6 minutes. Local operations are stable — no urgency beyond restoring corporate visibility.",
          priority: 'High',
          generatedBy: 'Sync Monitor · 8m ago',
        },
      ],
    },
  },
  expansion: {
    workflow: {
      steps: [
        { label: 'Facility added to network registry', status: 'done',    at: 'Aug 10' },
        { label: 'Staff import from Workday',          status: 'done',    at: 'Aug 15' },
        { label: 'Local network setup complete',       status: 'done',    at: 'Aug 18' },
        { label: 'Corporate network connection',       status: 'active',  at: null     },
        { label: 'Go-live verification',               status: 'pending', at: null     },
      ],
      nextTrigger: 'Network connection for TEM-07 awaiting corporate admin approval',
      startedAt: 'Aug 10, 2026',
      owner: 'Network Provisioner (agent)',
    },
    agent: {
      sessionStart: 'Aug 21, 6:00 AM',
      messageCount: 7,
      summary: "Tempe Outpatient Clinic (TEM-07) is completing onboarding as the 19th facility in the Meridian Health Network. Three of six onboarding steps are complete. Local network setup is done and the facility is ready for corporate network connection. 62 staff have been imported from Workday. Target go-live is Q3 end.",
      recommendation: "Approve the corporate network connection for TEM-07 — this is the final blocking step before go-live. All infrastructure checks passed.",
      lastExchange: [
        { role: 'agent', text: "TEM-07 is at step 4 of 6. Local network setup is complete and all infrastructure checks passed. Pending your approval to connect it to the corporate network. After that, only go-live verification remains." },
      ],
    },
    nba: {
      signals: [
        { label: 'TEM-07 ready for corporate network connection',      weight: 'high' },
        { label: 'Q3 go-live target — registration is the blocker',   weight: 'high' },
        { label: '62 staff imported from Workday — ready to activate', weight: 'medium' },
        { label: 'All infrastructure checks passed — no blockers',    weight: 'medium' },
        { label: 'This completes 19 of planned 22 network facilities', weight: 'low' },
      ],
      model: 'Network Provisioner v1.1',
      generatedAt: 'Aug 21, 6:30 AM',
      primaryCta: 'review-htl',
    },
    htl: {
      autoSaved: [
        { label: 'Facility added to network registry', detail: 'Aug 10, 2026 · Tempe Outpatient Clinic registered as TEM-07 in Meridian network — informational only' },
        { label: 'Staff import completed', detail: '62 staff records imported from Workday HR People Graph v3.2 — auto-applied, no approval needed' },
        { label: 'Local network setup complete', detail: 'TEM-07 local network setup complete Aug 18 · all infrastructure checks passed — informational only' },
      ],
      items: [
        {
          id: 'h-meridian-expansion-1',
          title: 'Approve Tempe Outpatient Clinic network connection',
          detail: "Network Provisioner has completed all pre-connection checks for Tempe Outpatient Clinic (TEM-07). Approving connects the facility to the corporate network, enabling full data sync and workflow coordination. This is the final blocking step before Q3 go-live.",
          priority: 'High',
          generatedBy: 'Network Provisioner · 2h ago',
        },
        {
          id: 'h-meridian-expansion-2',
          title: 'Schedule go-live verification call with TEM-07 facility admin',
          detail: "Once kernel registration is complete, a go-live verification with the facility admin is required before activating staff access. Approving creates a calendar event and notifies the TEM-07 ops lead.",
          priority: 'Medium',
          generatedBy: 'Network Provisioner · 2h ago',
        },
      ],
    },
  },
}

const SOURCE_META = {
  human:    { Icon: User,      color: '#34D399', label: 'HTL',        tagVariant: 'limeGreen' },
  agent:    { Icon: Bot,       color: '#A78BFA', label: 'Agentic',    tagVariant: 'purple'    },
  system:   { Icon: Shield,    color: '#94A3B8', label: 'Governance', tagVariant: 'neutral'   },
  workflow: { Icon: GitBranch, color: '#60A5FA', label: 'HGS',        tagVariant: 'lightBlue' },
}

const SEV_ORDER = { critical: 0, warning: 1, info: 2, success: 3 }

const PRIMARY_ICON = { Message: MessageSquare, Email: Mail, 'Contact account': Phone }
const PRIMARY_PANEL = { Message: 'sms', Email: 'email', 'Contact account': 'email' }

function getSignalStyle(n) {
  if (n.source === 'agent' && n.severity !== 'critical') {
    return {
      bg: 'bg-purple-900/40', border: 'border-purple-600/30',
      text: 'text-purple-200', iconColor: 'text-purple-400',
      Icon: Sparkles, sublabel: 'NBA engine · confidence 82%',
    }
  }
  if (n.severity === 'critical') {
    return {
      bg: 'bg-red-900/40', border: 'border-red-600/30',
      text: 'text-red-200', iconColor: 'text-red-400',
      Icon: CircleX, sublabel: null,
    }
  }
  if (n.severity === 'warning') {
    return {
      bg: 'bg-amber-900/40', border: 'border-amber-600/30',
      text: 'text-amber-200', iconColor: 'text-amber-400',
      Icon: TriangleAlert, sublabel: null,
    }
  }
  return {
    bg: 'bg-blue-900/40', border: 'border-blue-600/30',
    text: 'text-blue-200', iconColor: 'text-blue-400',
    Icon: Sparkles, sublabel: null,
  }
}

function initialsOf(name) {
  return (name.match(/\b\w/g) || []).slice(0, 2).join('').toUpperCase() || '--'
}

function resolveInfo({ entity, base, placement }) {
  const pick = (field) => entity?.[field] ?? base[field]
  return {
    name: entity?.name || (placement?.scope === 'entity' && placement?.entityName) || base.name,
    email: pick('email'),
    phone: pick('phone'),
    address: pick('address'),
    company: pick('company'),
    owner: pick('owner'),
    status: pick('status'),
    title: entity?.title ?? base.title,
  }
}

function firstNameOf(name) {
  return (name || '').trim().split(/\s+/)[0] || 'there'
}

function fillTemplate(text, info) {
  return text
    .replace(/\{\{first_name\}\}/g, firstNameOf(info.name))
    .replace(/\{\{company\}\}/g, info.company || 'your team')
}

function downloadVCard(info) {
  const parts = (info.name || '').trim().split(/\s+/)
  const firstName = parts.slice(0, -1).join(' ') || parts[0] || ''
  const lastName = parts.length > 1 ? parts[parts.length - 1] : ''
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${info.name || ''}`,
    `N:${lastName};${firstName};;;`,
    info.title ? `TITLE:${info.title}` : null,
    info.company ? `ORG:${info.company}` : null,
    info.email ? `EMAIL:${info.email}` : null,
    info.phone ? `TEL:${info.phone}` : null,
    info.address ? `ADR:;;${info.address};;;;` : null,
    'END:VCARD',
  ].filter(Boolean).join('\r\n')
  const blob = new Blob([lines], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(info.name || 'contact').replace(/\s+/g, '_')}.vcf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const EMAIL_TEMPLATES = [
  { id: 'followup', label: 'Follow-up', subject: 'Following up, {{first_name}}', body: 'Hi {{first_name}},\n\nJust following up on our recent conversation. Let me know if there is anything I can help with at {{company}}.\n\nBest regards' },
  { id: 'checkin', label: 'Check-in', subject: 'Quick check-in', body: 'Hi {{first_name}},\n\nWanted to check in and see how things are going at {{company}}. Happy to hop on a quick call if useful.\n\nThanks' },
  { id: 'renewal', label: 'Renewal reminder', subject: 'Your upcoming renewal', body: 'Hi {{first_name}},\n\nA quick reminder that {{company}} has a renewal coming up. I would love to walk you through the options before then.\n\nBest' },
]
const SMS_TEMPLATES = [
  { id: 'appt', label: 'Appointment reminder', body: 'Hi {{first_name}}, reminder about our upcoming appointment. Reply to confirm or reschedule.' },
  { id: 'quickfu', label: 'Quick follow-up', body: 'Hi {{first_name}}, just following up -- let me know if you have any questions.' },
  { id: 'thanks', label: 'Thanks', body: 'Thanks {{first_name}}! Great talking with you and the {{company}} team.' },
]
const CHAT_PROMPTS = ['Summarize recent activity', 'Any open items?', 'Draft a follow-up email']

export default function EntityContextHeader({ placement, entity, viewerRole, onChat }) {
  const navigate = useNavigate()
  const { logActivity } = useActivity()
  const { items: notifItems, markRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const [panel, setPanel] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeChip, setActiveChip] = useState(null)
  const [companyScenario, setCompanyScenario] = useState('health')
  const can = (action) => actionAllowedFor(action, viewerRole)
  const denyTip = (verb) => `Not available for ${viewerRole} -- this role cannot ${verb}`

  const profileType = entity ? ENTITY_TO_PROFILE[entity.type] || 'Contact' : placement?.profileType
  const base = PERSONAS[profileType] || PERSONAS.Contact
  const info = resolveInfo({ entity, base, placement })
  const name = info.name
  const EntityIcon = base.icon
  const lower = base.kind.toLowerCase()
  const isSample = !entity

  const signal = [...notifItems]
    .filter((n) => n.unread)
    .sort((a, b) => (SEV_ORDER[a.severity] ?? 4) - (SEV_ORDER[b.severity] ?? 4))[0] || null

  const rawCtx = AGENTIC_CONTEXT[profileType] || null
  const ctx = (profileType === 'Company' && COMPANY_SCENARIOS[companyScenario]) ? COMPANY_SCENARIOS[companyScenario] : rawCtx
  const activeDetail = (profileType === 'Company' && companyScenario !== 'health' && COMPANY_SCENARIO_CHIPS[companyScenario]) ? COMPANY_SCENARIO_CHIPS[companyScenario] : CHIP_DETAIL[profileType]
  const nbaActive = ctx?.nba?.primary
  const PrimaryIcon = nbaActive ? Zap : (PRIMARY_ICON[base.primaryAction] || Mail)
  const primaryLabel = nbaActive ? ctx.nba.label : base.primaryAction
  const primaryPanel = nbaActive ? 'email' : (PRIMARY_PANEL[base.primaryAction] || 'email')
  const primaryCanKey = primaryPanel === 'sms' ? 'sms' : 'email'
  const primaryChipTarget = nbaActive && ctx?.nba?.chipTarget ? ctx.nba.chipTarget : null

  return (
    <div className="card mb-3 p-0">
      {/* Identity row */}
      <div className="flex flex-wrap items-center gap-3 px-4 pt-4 pb-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold text-white ${base.avatarBg}`}>
          {initialsOf(name)}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-base font-bold text-gray-900 dark:text-slate-100">{name}</span>
            {isSample && (
              <span className="group relative inline-flex items-center">
                <span className="h-1.5 w-1.5 cursor-default rounded-full bg-amber-400" aria-label="Sample data" />
                <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] text-gray-600 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 dark:border-white/10 dark:bg-gray-900 dark:text-slate-300">
                  Sample data — this is how it looks with real records
                </span>
              </span>
            )}
          </div>
          {ctx && (
            <div className="flex flex-wrap gap-1.5">
              {ctx.memoryLayers ? (
                // Memory layer chips — UCP Contact profile (Short / Mid / Long-term)
                <>
                  <ContextChip icon={Clock} color="amber"
                    label={ctx.memoryLayers.short.label}
                    onClick={() => setActiveChip('htl')} />
                  <ContextChip icon={GitBranch} color="blue"
                    label={ctx.memoryLayers.mid.label}
                    onClick={() => setActiveChip('workflow')} />
                  <ContextChip icon={Database} color="gray"
                    label={ctx.memoryLayers.long.label} />
                </>
              ) : (
                // Standard agentic chips — Company, Employee, Deal
                <>
                  <ContextChip icon={GitBranch} color="blue"
                    label={`${ctx.workflow.name} · ${ctx.workflow.status}`}
                    onClick={() => setActiveChip('workflow')} />
                  <ContextChip icon={Bot} color="purple"
                    label={`${ctx.lastAgent.name} · ${ctx.lastAgent.ago}`}
                    onClick={() => setActiveChip('agent')} />
                  {ctx.nba && (
                    <ContextChip icon={Zap} color="green"
                      label={`NBA: ${ctx.nba.label}${ctx.nba.confidence != null ? ` · ${ctx.nba.confidence}%` : ''}`}
                      onClick={() => setActiveChip('nba')} />
                  )}
                  {ctx.htlPending > 0 && (
                    <ContextChip icon={User} color="amber"
                      label={`HTL pending · ${ctx.htlPending}`}
                      onClick={() => setActiveChip('htl')} />
                  )}
                </>
              )}
            </div>
          )}
          {profileType === 'Company' && (
            <div className="mt-1 flex gap-1">
              {[['health', 'Network health'], ['alert', 'Location alert'], ['expansion', 'New location']].map(([key, label]) => (
                <button key={key} type="button"
                  onClick={() => setCompanyScenario(key)}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                    companyScenario === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 dark:text-slate-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <span
            className="hidden items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-gray-400 sm:inline-flex dark:text-slate-400"
            title="Locked -- part of the template, always shown"
          >
            <Lock size={11} aria-hidden="true" /> Locked
          </span>
          <button
            type="button"
            onClick={onChat || (() => setPanel('chat'))}
            title={`AI assistant for this ${lower}`}
            aria-label={`AI assistant for this ${lower}`}
            className="grid h-8 w-8 place-items-center rounded-lg text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg,#06B6D4,#2563EB)' }}
          >
            <Sparkles size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => primaryChipTarget ? setActiveChip(primaryChipTarget) : setPanel(primaryPanel)}
            disabled={!can(primaryCanKey)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-aims-blue px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-aims-blue/90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-aims-blue"
            title={can(primaryCanKey) ? primaryLabel : denyTip('send messages')}
            aria-label={primaryLabel}
          >
            <PrimaryIcon size={14} aria-hidden="true" />
            <span className="hidden md:inline">{primaryLabel}</span>
          </button>
          {primaryPanel !== 'sms' && (
            <IconBtn
              label={can('sms') ? `Text this ${lower}` : denyTip('send texts')}
              onClick={() => setPanel('sms')}
              disabled={!can('sms')}
            >
              <MessageSquare size={15} />
            </IconBtn>
          )}
          <div className="relative">
            <IconBtn label="More" onClick={() => setMenuOpen((m) => !m)} expanded={menuOpen}>
              <MoreHorizontal size={15} />
            </IconBtn>
            {menuOpen && (
              <MoreMenu
                info={info}
                entityId={entity?.id}
                canContact={can('contact')}
                navigate={navigate}
                onClose={() => setMenuOpen(false)}
              />
            )}
          </div>
          <IconBtn label={open ? 'Hide details' : 'Show details'} onClick={() => setOpen((o) => !o)} expanded={open}>
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </IconBtn>
        </div>
      </div>


      {/* Details — zoned layout */}
      {open && (
        ctx ? (
          <div className="space-y-3 border-t border-gray-100 p-4 dark:border-white/10">
            <div className="space-y-2">
              <ZoneLabel label="AI activity" color="blue" />
              <div className="grid grid-cols-3 gap-2">
                {ctx.nba && (
                  <AgenticCard icon={Zap} color="green"
                    label="Recommended action"
                    value={ctx.nba.confidence != null ? `${ctx.nba.label} · ${ctx.nba.confidence}%` : ctx.nba.label}
                    onClick={() => setActiveChip('nba')} />
                )}
                <AgenticCard icon={GitBranch} color="blue"
                  label="Active workflow"
                  value={`${ctx.workflow.name} · ${ctx.workflow.status}`}
                  onClick={() => setActiveChip('workflow')} />
                <AgenticCard icon={Bot} color="purple"
                  label="Last agent run"
                  value={`${ctx.lastAgent.name} · ${ctx.lastAgent.ago}`}
                  onClick={() => setActiveChip('agent')} />
              </div>
            </div>
            {ctx.htlPending > 0 && (
              <div className="space-y-2">
                <ZoneLabel label="Your review" color="amber" />
                <HTLZoneCard
                  ctx={ctx}
                  detail={activeDetail}
                  onClick={() => setActiveChip('htl')}
                />
              </div>
            )}
            {(base.detailFields || []).some(f => f.record) && (
              <div className="space-y-2">
                <ZoneLabel label="Record" color="gray" onInfo={() => setActiveChip('provenance')} />
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                  {(base.detailFields || []).filter(f => f.record).map(f => (
                    <DetailField key={f.label} icon={f.icon} label={f.label} value={f.value} source={f.source} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-2.5 border-t border-gray-100 p-4 sm:grid-cols-3 dark:border-white/10">
            {(base.detailFields || []).map((f) => (
              <DetailField key={f.label} icon={f.icon} label={f.label} value={f.value} source={f.source} />
            ))}
          </div>
        )
      )}

      {(panel === 'email' || panel === 'sms') && (
        <ActionComposer
          kind={panel}
          name={name}
          info={info}
          onClose={() => setPanel(null)}
          onSent={(payload) => entity?.id && logActivity(entity.id, payload)}
        />
      )}
      {panel === 'chat' && <AgentChatPanel name={name} kindLabel={base.kind} onClose={() => setPanel(null)} />}
      {activeChip === 'provenance' && (
        <ProvenanceSlideOut
          fields={(base.detailFields || []).filter(f => f.record && f.source)}
          onClose={() => setActiveChip(null)}
        />
      )}
      {activeChip && activeChip !== 'provenance' && (
        <ChipSlideOut
          type={activeChip}
          ctx={ctx}
          detail={activeDetail}
          name={name}
          onClose={() => setActiveChip(null)}
          onAction={(cta) => {
            setActiveChip(null)
            if (cta === 'send-proposal') setPanel('email')
            if (cta === 'review-htl') setActiveChip('htl')
          }}
        />
      )}
    </div>
  )
}

function SignalBanner({ signal, onAction, onViewAll }) {
  const style = getSignalStyle(signal)
  const SigIcon = style.Icon
  const cta = signal.ctas?.[0] || null

  return (
    <div className={`mx-4 mb-3 flex items-center gap-2.5 rounded-lg border px-3 py-2 ${style.bg} ${style.border}`}>
      <SigIcon size={14} className={`shrink-0 ${style.iconColor}`} aria-hidden="true" />
      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
        <span className={`truncate text-[12px] font-semibold ${style.text}`}>{signal.title}</span>
        {style.sublabel && (
          <span className={`hidden shrink-0 text-[11px] opacity-60 sm:inline ${style.text}`}>
            · {style.sublabel}
          </span>
        )}
      </div>
      {cta ? (
        <Button variant="secondary" size="sm" className="shrink-0" onClick={onAction}>
          {cta}
        </Button>
      ) : (
        <button
          type="button"
          onClick={onViewAll}
          className={`shrink-0 ${style.iconColor} hover:opacity-80`}
          aria-label="View all notifications"
        >
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  )
}

const CHIP_COLORS = {
  blue:   'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700/30 dark:bg-blue-900/40 dark:text-blue-300',
  purple: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700/30 dark:bg-purple-900/40 dark:text-purple-300',
  green:  'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-600/30 dark:bg-emerald-900/30 dark:text-emerald-300',
  amber:  'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-600/30 dark:bg-amber-900/40 dark:text-amber-300',
  gray:   'border-gray-200 bg-gray-50 text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400',
}

function ContextChip({ icon: Icon, color = 'gray', label, onClick }) {
  const cls = `inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${CHIP_COLORS[color] || CHIP_COLORS.gray}`
  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label={label}
        className={`${cls} cursor-pointer transition-opacity hover:opacity-75`}>
        <Icon size={10} aria-hidden="true" />
        {label}
      </button>
    )
  }
  return (
    <span className={cls}>
      <Icon size={10} aria-hidden="true" />
      {label}
    </span>
  )
}

function IconBtn({ label, onClick, expanded, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-expanded={expanded}
      title={label}
      className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:border-white/15 dark:text-slate-400 dark:hover:bg-white/5"
    >
      {children}
    </button>
  )
}

function DetailField({ icon: Icon, label, value, source }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="mt-0.5 shrink-0 text-gray-400 dark:text-slate-400" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-400">{label}</div>
        <div className="flex items-center gap-1.5">
          <div className="truncate text-sm text-gray-700 dark:text-slate-200">{value}</div>
          {source && <SourceBadge source={source} />}
        </div>
      </div>
    </div>
  )
}

const SOURCE_BADGE_COLORS = {
  Salesforce: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300', abbr: 'SF' },
  HubSpot:    { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300', abbr: 'HS' },
  Workday:    { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300', abbr: 'WD' },
  Okta:       { bg: 'bg-sky-100 dark:bg-sky-900/40', text: 'text-sky-700 dark:text-sky-300', abbr: 'OK' },
}

function SourceBadge({ source }) {
  const cfg = SOURCE_BADGE_COLORS[source.system] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', abbr: source.system.slice(0, 2).toUpperCase() }
  return (
    <span className="group relative shrink-0 inline-flex">
      <span className={`inline-flex h-4 items-center rounded px-1 text-[9px] font-bold tracking-wide ${cfg.bg} ${cfg.text}`}>
        {cfg.abbr}
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] text-gray-700 opacity-0 shadow-md transition-opacity group-hover:opacity-100 dark:border-white/10 dark:bg-gray-900 dark:text-slate-200">
        <div className="font-semibold">{source.system}</div>
        <div className="text-gray-400 dark:text-slate-400">{source.model}</div>
        <div className="text-gray-400 dark:text-slate-400">Synced {source.syncedAgo}</div>
      </span>
    </span>
  )
}

function MoreMenu({ info, entityId, canContact, navigate, onClose }) {
  const copy = (text) => {
    navigator.clipboard?.writeText(text).catch(() => {})
    onClose()
  }
  return (
    <PopoverPanel onClose={onClose} align="right" className="w-48 overflow-hidden py-1">
      {entityId && (
        <MenuItem icon={ExternalLink} onClick={() => { onClose(); navigate(`/ucp/${entityId}`) }}>View full profile</MenuItem>
      )}
      {canContact ? (
        <>
          <MenuItem icon={Copy} onClick={() => copy(info.email)}>Copy email</MenuItem>
          <MenuItem icon={Copy} onClick={() => copy(info.phone)}>Copy phone</MenuItem>
        </>
      ) : (
        <div className="px-3 py-1.5 text-[11px] text-gray-400 dark:text-slate-400">Contact details restricted for this role</div>
      )}
      <MenuItem icon={Download} onClick={() => { downloadVCard(info); onClose() }}>Download vCard</MenuItem>
    </PopoverPanel>
  )
}
function MenuItem({ icon: Icon, onClick, children }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-white/5"
    >
      <Icon size={14} className="text-gray-400 dark:text-slate-400" aria-hidden="true" /> {children}
    </button>
  )
}

function ActionComposer({ kind, name, info, onClose, onSent }) {
  const ref = useFocusTrap()
  const titleId = useId()
  const tplId = useId()
  const [sent, setSent] = useState(false)
  const [body, setBody] = useState('')
  const [subject, setSubject] = useState('')
  const [tpl, setTpl] = useState('')
  const isEmail = kind === 'email'
  const to = isEmail ? info.email : info.phone
  const templates = isEmail ? EMAIL_TEMPLATES : SMS_TEMPLATES

  const handleSend = () => {
    onSent?.({
      type: kind,
      title: isEmail ? subject.trim() || 'Email' : 'Text message',
      detail: `Sent to ${to}`,
    })
    setSent(true)
  }

  const applyTemplate = (id) => {
    setTpl(id)
    const t = templates.find((x) => x.id === id)
    if (!t) return
    setBody(fillTemplate(t.body, info))
    if (isEmail && t.subject) setSubject(fillTemplate(t.subject, info))
  }

  return (
    <Overlay onClose={onClose}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="card relative z-10 w-[90vw] max-w-[460px] p-0 outline-none" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-white/10">
          <h2 id={titleId} className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
            {isEmail ? <Mail size={15} /> : <MessageSquare size={15} />} {isEmail ? 'Email' : 'Text'} {name}
          </h2>
          <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={16} />
          </button>
        </div>
        {sent ? (
          <div className="p-5 text-center">
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-green-200 bg-green-50 text-aims-governed dark:border-green-500/25 dark:bg-green-500/10">
              <Send size={18} />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-900 dark:text-slate-100">{isEmail ? 'Email' : 'Message'} queued to {name}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">This is a preview -- no message was delivered in this demo.</p>
            <Button variant="secondary" onClick={onClose} className="mt-4">Done</Button>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            <div>
              <label htmlFor={tplId} className="mb-1 block text-xs font-medium text-gray-700 dark:text-slate-200">Template</label>
              <select id={tplId} className="input" value={tpl} onChange={(e) => applyTemplate(e.target.value)}>
                <option value="">Start from scratch...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
            <Labeled label="To"><div className="input flex items-center text-gray-500 dark:text-slate-400">{to}</div></Labeled>
            {isEmail && (
              <Labeled label="Subject">
                <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
              </Labeled>
            )}
            <Labeled label="Message">
              <textarea rows={isEmail ? 5 : 3} className="input" value={body} onChange={(e) => setBody(e.target.value)} placeholder={`Write your ${isEmail ? 'email' : 'message'}...`} />
            </Labeled>
            <div className="flex justify-end gap-2">
              <Button variant="tertiary" onClick={onClose}>Cancel</Button>
              <Button variant="primary" onClick={handleSend} disabled={!body.trim()}>
                <Send size={14} /> Send
              </Button>
            </div>
          </div>
        )}
      </div>
    </Overlay>
  )
}

function AgentChatPanel({ name, kindLabel, onClose }) {
  const ref = useFocusTrap()
  const titleId = useId()
  const [msgs, setMsgs] = useState([
    { from: 'agent', text: `Hi -- I am your AI assistant for this ${kindLabel.toLowerCase()}. Ask me anything about ${name}.` },
  ])
  const [draft, setDraft] = useState('')
  const send = (text) => {
    const q = (text ?? draft).trim()
    if (!q) return
    setMsgs((m) => [
      ...m,
      { from: 'user', text: q },
      { from: 'agent', text: `Here is what I found about ${name} for "${q}": activity is healthy, with no open escalations. (Demo -- canned response.)` },
    ])
    setDraft('')
  }
  return (
    <Overlay onClose={onClose}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="card relative z-10 flex max-h-[80vh] w-[90vw] max-w-[440px] flex-col p-0 outline-none" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-white/10">
          <h2 id={titleId} className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
            <Bot size={15} className="text-aims-blue" /> Ask AI · {name}
          </h2>
          <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 space-y-2 overflow-auto p-4">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <span className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.from === 'user' ? 'bg-aims-blue text-white' : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-slate-200'}`}>
                {m.text}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 p-3 dark:border-white/10">
          <div className="mb-2 flex flex-wrap gap-1.5" role="group" aria-label="Suggested prompts">
            {CHAT_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => send(p)}
                className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600 hover:border-aims-blue/40 hover:bg-aims-blue/5 hover:text-aims-blue dark:border-white/15 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              className="input flex-1"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask about this profile..."
              aria-label="Message the assistant"
            />
            <Button variant="primary" onClick={() => send()} disabled={!draft.trim()} className="!px-2.5" aria-label="Send">
              <Send size={15} />
            </Button>
          </div>
        </div>
      </div>
    </Overlay>
  )
}

function Overlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      {children}
    </div>
  )
}

function Labeled({ label, children }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-gray-700 dark:text-slate-200">{label}</div>
      {children}
    </div>
  )
}

// ── Data Provenance SlideOut ───────────────────────────────────────────────────

function ProvenanceSlideOut({ fields, onClose }) {
  const id = useId()
  const panelRef = useFocusTrap()

  const SYSTEM_COLORS = {
    Salesforce: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    HubSpot:    'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    Workday:    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    Okta:       'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        onKeyDown={e => e.key === 'Escape' && onClose()}
        tabIndex={-1}
        className="fixed bottom-0 right-0 top-0 z-50 flex w-80 flex-col border-l border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-gray-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Database size={14} className="text-gray-400 dark:text-slate-400" aria-hidden="true" />
            <h2 id={`${id}-title`} className="text-sm font-semibold text-gray-900 dark:text-white">
              Data Provenance
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-slate-300"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Intro */}
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
          <p className="text-[11px] text-gray-500 dark:text-slate-400">
            Each field below was pulled from a source system, unified by a data model, and surfaced here in the UCP.
          </p>
        </div>

        {/* Field list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {fields.map(f => {
            const sysCls = SYSTEM_COLORS[f.source.system] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
            return (
              <div key={f.label} className="rounded-lg border border-gray-100 bg-gray-50/60 p-3 dark:border-white/10 dark:bg-white/5">
                {/* Field name + value */}
                <div className="mb-2.5 flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">{f.label}</div>
                    <div className="mt-0.5 text-sm font-medium text-gray-800 dark:text-slate-100">{f.value}</div>
                  </div>
                  <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide ${sysCls}`}>
                    {f.source.system}
                  </span>
                </div>

                {/* Lineage chain */}
                <div className="space-y-1">
                  <LineageRow step="Source" label={f.source.system} note={`Synced ${f.source.syncedAgo}`} />
                  <LineageArrow />
                  <LineageRow step="Model" label={f.source.model} note="Unified layer" />
                  <LineageArrow />
                  <LineageRow step="UCP" label={f.label} note="Displayed here" />
                </div>
              </div>
            )
          })}
          {fields.length === 0 && (
            <p className="py-6 text-center text-[12px] text-gray-400 dark:text-slate-500">
              No sourced fields on this record.
            </p>
          )}
        </div>
      </div>
    </>
  )
}

function LineageRow({ step, label, note }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 shrink-0 text-[9px] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">{step}</span>
      <div className="min-w-0 flex-1 rounded border border-gray-200 bg-white px-2 py-1 dark:border-white/10 dark:bg-gray-800">
        <div className="truncate text-[11px] font-medium text-gray-700 dark:text-slate-200">{label}</div>
        {note && <div className="text-[10px] text-gray-400 dark:text-slate-500">{note}</div>}
      </div>
    </div>
  )
}

function LineageArrow() {
  return (
    <div className="ml-12 flex items-center">
      <div className="h-3 w-px bg-gray-200 dark:bg-white/10" />
    </div>
  )
}

// ── Zoned detail helpers ───────────────────────────────────────────────────────

function ZoneLabel({ label, color = 'gray', onInfo }) {
  const clr = {
    blue:  'text-blue-600 dark:text-blue-400',
    amber: 'text-amber-600 dark:text-amber-400',
    gray:  'text-gray-400 dark:text-slate-500',
  }
  return (
    <div className="flex items-center gap-2">
      <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-widest ${clr[color] || clr.gray}`}>
        {label}
      </span>
      <div className="flex-1 border-t border-gray-100 dark:border-white/10" />
      {onInfo && (
        <button
          onClick={onInfo}
          className="shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
          aria-label="View data provenance"
        >
          <Info size={12} />
        </button>
      )}
    </div>
  )
}

const AGENTIC_CARD_COLORS = {
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-700/20',
    label: 'text-emerald-600 dark:text-emerald-400',
    value: 'text-emerald-800 dark:text-emerald-200',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-700/20',
    label: 'text-blue-600 dark:text-blue-400',
    value: 'text-blue-800 dark:text-blue-200',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-700/20',
    label: 'text-purple-600 dark:text-purple-400',
    value: 'text-purple-800 dark:text-purple-200',
  },
}

function AgenticCard({ icon: Icon, color, label, value, onClick }) {
  const c = AGENTIC_CARD_COLORS[color] || AGENTIC_CARD_COLORS.blue
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col gap-1 rounded-lg border p-2.5 text-left transition-opacity hover:opacity-80 ${c.bg} ${c.border}`}
    >
      <div className={`flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest ${c.label}`}>
        <Icon size={9} aria-hidden="true" />
        {label}
      </div>
      <div className={`text-xs font-medium leading-snug ${c.value}`}>{value}</div>
    </button>
  )
}

function HTLZoneCard({ ctx, detail, onClick }) {
  const firstItem = detail?.htl?.items?.[0]
  const autoSavedCount = ctx.autoSavedCount || 0
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-left transition-opacity hover:opacity-80 dark:border-amber-700/20 dark:bg-amber-900/20"
    >
      {autoSavedCount > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-2 py-1 dark:bg-emerald-900/20">
          <CheckCircle2 size={11} className="shrink-0 text-emerald-500" aria-hidden="true" />
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
            {autoSavedCount} insight{autoSavedCount !== 1 ? 's' : ''} saved automatically · no action needed
          </span>
        </div>
      )}
      <div className="flex items-center gap-3">
        <User size={14} className="shrink-0 text-amber-500" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            {ctx.htlPending} action{ctx.htlPending > 1 ? 's' : ''} pending your review
          </div>
          {firstItem && (
            <div className="mt-0.5 truncate text-xs font-medium text-amber-800 dark:text-amber-200">
              {firstItem.title}
            </div>
          )}
          {firstItem && (
            <div className="text-[10px] text-amber-600/70 dark:text-amber-400/60">{firstItem.generatedBy}</div>
          )}
        </div>
        <span className="shrink-0 rounded-md bg-amber-500 px-2 py-1 text-[10px] font-semibold text-white">
          Review
        </span>
      </div>
    </button>
  )
}

// ── Chip SlideOut ─────────────────────────────────────────────────────────────

const CHIP_HEADERS = {
  workflow: { Icon: GitBranch, color: 'text-blue-500'   },
  agent:    { Icon: Bot,       color: 'text-purple-400' },
  nba:      { Icon: Zap,       color: 'text-emerald-500'},
  htl:      { Icon: User,      color: 'text-amber-500'  },
}

function ChipSlideOut({ type, ctx, detail, name, onClose, onAction }) {
  const ref = useFocusTrap()
  const h = CHIP_HEADERS[type] || {}
  const HIcon = h.Icon || Sparkles
  const d = detail?.[type]

  const titles = {
    workflow: ctx?.workflow?.name || 'Workflow',
    agent:    ctx?.lastAgent?.name || 'Agent',
    nba:      ctx?.nba?.label || 'Next Best Action',
    htl:      'Pending Decisions',
  }
  const subs = {
    workflow: ctx?.workflow?.status,
    agent:    `Last active ${ctx?.lastAgent?.ago}`,
    nba:      ctx?.nba?.confidence != null ? `${ctx.nba.confidence}% confidence` : 'AI-recommended action',
    htl:      `${ctx?.htlPending} awaiting review`,
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={titles[type]}
        tabIndex={-1}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        className="relative z-10 flex h-full w-full max-w-[380px] flex-col bg-white shadow-2xl outline-none dark:bg-[#0F1117]"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-white/10">
          <div className="flex items-center gap-2">
            <HIcon size={16} className={`shrink-0 ${h.color}`} aria-hidden="true" />
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">{titles[type]}</div>
              {subs[type] && <div className="text-[11px] text-gray-400 dark:text-slate-400">{subs[type]}</div>}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close"
            className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {type === 'workflow' && d && <WorkflowPanel data={d} ctx={ctx} />}
          {type === 'agent'    && d && <AgentPanel    data={d} ctx={ctx} />}
          {type === 'nba'      && d && <NBAPanel      data={d} ctx={ctx} name={name} onAction={onAction} />}
          {type === 'htl'      && d && <HTLPanel      data={d} />}
          {!d && <p className="text-sm text-gray-400 dark:text-slate-500">No detail available for this context.</p>}
        </div>
      </div>
    </div>
  )
}

const STEP_ICONS = {
  done:    <CheckCircle2 size={14} className="text-emerald-500" />,
  active:  <div className="h-3.5 w-3.5 rounded-full border-2 border-blue-500 bg-blue-100 dark:bg-blue-900/40" />,
  pending: <Circle      size={14} className="text-gray-300 dark:text-slate-600" />,
}

function WorkflowPanel({ data, ctx }) {
  const done = data.steps.filter((s) => s.status === 'done').length
  const pct  = Math.round((done / data.steps.length) * 100)
  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
          <span>{done} of {data.steps.length} steps complete</span>
          <span className="font-medium capitalize text-blue-600 dark:text-blue-400">{ctx.workflow.status}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
          <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="space-y-3">
        {data.steps.map((s, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="mt-0.5 shrink-0">{STEP_ICONS[s.status]}</div>
            <div className="min-w-0 flex-1">
              <div className={`text-sm ${s.status === 'pending' ? 'text-gray-400 dark:text-slate-500' : 'text-gray-800 dark:text-slate-200'}`}>{s.label}</div>
              {s.at && <div className="text-[11px] text-gray-400 dark:text-slate-500">{s.at}</div>}
            </div>
          </div>
        ))}
      </div>
      {data.nextTrigger && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-700/20 dark:bg-blue-900/20">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">Next trigger</div>
          <div className="mt-0.5 text-xs text-blue-700 dark:text-blue-300">{data.nextTrigger}</div>
        </div>
      )}
      <div className="space-y-1 text-[11px] text-gray-400 dark:text-slate-500">
        <div>Started · {data.startedAt}</div>
        <div>Owner · {data.owner}</div>
      </div>
    </div>
  )
}

function AgentPanel({ data }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-[11px] text-gray-500 dark:text-slate-400">
        <span>Session · {data.sessionStart}</span>
        <span>{data.messageCount} messages</span>
      </div>
      <div>
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Session summary</div>
        <p className="text-sm text-gray-700 dark:text-slate-200">{data.summary}</p>
      </div>
      {data.lastExchange?.length > 0 && (
        <div>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Agent's latest finding</div>
          {data.lastExchange.map((m, i) => (
            <div key={i} className="rounded-xl bg-purple-50 p-3 text-sm text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
              {m.text}
            </div>
          ))}
        </div>
      )}
      {data.recommendation && (
        <div className="rounded-lg border border-purple-100 bg-purple-50 p-3 dark:border-purple-700/20 dark:bg-purple-900/20">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-purple-500 dark:text-purple-400">Recommendation</div>
          <div className="mt-0.5 text-xs text-purple-700 dark:text-purple-300">{data.recommendation}</div>
        </div>
      )}
    </div>
  )
}

const WEIGHT_DOT = {
  high:   'bg-emerald-500',
  medium: 'bg-amber-400',
  low:    'bg-gray-300 dark:bg-slate-600',
}

function NBAPanel({ data, ctx, onAction }) {
  return (
    <div className="space-y-5">
      {ctx.nba.confidence != null ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 dark:border-emerald-700/20 dark:bg-emerald-900/20">
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{ctx.nba.confidence}%</div>
          <div>
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Confidence score</div>
            <div className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70">Generated by {data.model}</div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 dark:border-emerald-700/20 dark:bg-emerald-900/20">
          <Sparkles size={20} className="shrink-0 text-emerald-500" aria-hidden="true" />
          <div>
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">AI-recommended action</div>
            <div className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70">Generated by {data.model}</div>
          </div>
        </div>
      )}
      <div>
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Supporting signals</div>
        <div className="space-y-2">
          {data.signals.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`h-2 w-2 shrink-0 rounded-full ${WEIGHT_DOT[s.weight] || WEIGHT_DOT.low}`} aria-label={s.weight} />
              <span className="text-sm text-gray-700 dark:text-slate-200">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="text-[11px] text-gray-400 dark:text-slate-500">Generated · {data.generatedAt}</div>
      <div className="border-t border-gray-100 pt-4 dark:border-white/10">
        <Button variant="primary" className="w-full" onClick={() => onAction?.(data.primaryCta)}>
          <Zap size={14} /> {ctx.nba.label}
        </Button>
        <button type="button" className="mt-2 w-full text-center text-xs text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300">
          Dismiss this suggestion
        </button>
      </div>
    </div>
  )
}

function HTLPanel({ data }) {
  const [resolved, setResolved] = useState(new Set())
  const items = (data?.items || []).filter((it) => !resolved.has(it.id))
  const autoSaved = data?.autoSaved || []
  const resolve = (id) => setResolved((s) => new Set([...s, id]))

  return (
    <div className="space-y-4">
      {autoSaved.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">
            Auto-saved · no action needed
          </div>
          {autoSaved.map((item, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg bg-emerald-50 p-2.5 dark:bg-emerald-900/20">
              <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
              <div>
                <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{item.label}</div>
                <div className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <CheckCircle2 size={28} className="text-emerald-500" />
          <div className="text-sm font-medium text-gray-700 dark:text-slate-200">All caught up</div>
          <div className="text-xs text-gray-400 dark:text-slate-400">No pending decisions</div>
        </div>
      ) : (
        <div className="space-y-3">
          {autoSaved.length > 0 && (
            <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">
              Awaiting your review
            </div>
          )}
          {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-amber-100 bg-amber-50 p-3 dark:border-amber-700/20 dark:bg-amber-900/20">
          <div className="mb-1 flex items-center justify-between">
            <span className="rounded-md border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:border-amber-600/30 dark:bg-amber-900/50 dark:text-amber-300">
              {item.priority}
            </span>
            <span className="text-[11px] text-amber-600/70 dark:text-amber-400/60">{item.generatedBy}</span>
          </div>
          <div className="mb-1 text-sm font-medium text-amber-800 dark:text-amber-200">{item.title}</div>
          <div className="mb-3 text-xs text-amber-700/80 dark:text-amber-300/70">{item.detail}</div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" className="flex-1" onClick={() => resolve(item.id)}>Approve</Button>
            <Button variant="secondary" size="sm" onClick={() => resolve(item.id)}>Dismiss</Button>
          </div>
        </div>
      ))}
        </div>
      )}
    </div>
  )
}
