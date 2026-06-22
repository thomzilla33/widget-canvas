// Human Touch Layer (HTL) Widget — the embeddable, customer-facing comms widget
// (launcher → AI chat → human handoff). This is a DIFFERENT widget class from the
// dashboard tiles: it isn't a metric+source, it's a configurable conversational
// surface. Config groups mirror the design-metadata spec.

export const HTL_DEFAULT = {
  // Identity & brand
  agentName: 'AIMS Assistant',
  avatarInitials: 'AI',
  primary: '#2563EB',
  secondary: '#EEF2F7',
  launcherPosition: 'bottom-right', // bottom-right | bottom-left
  theme: 'system', // light | dark | system
  // Channels
  channels: { text: true, voice: true, video: false, screen: false, payment: false, sign: false, cobrowse: false },
  // Behavior & state
  trigger: 'user_click', // page_load | user_click | time_delay | scroll_depth | exit_intent
  defaultState: 'minimized', // expanded | minimized | hidden
  persistence: 'cross_session', // session | cross_session
  greeting: 'Hi! How can we help you today?',
  preChat: false,
  postSurvey: 'csat', // none | csat | nps
  // HTL Pack binding (escalation policy)
  packId: 'htl-pack-7f3a-c204',
  packVersion: 'latest', // latest | pinned
  transitionMsg: 'Connecting you with a specialist…',
  continuation: 'handoff', // handoff (AI ends) | continuation (AI pauses & resumes)
  showWait: true,
  showQueue: false,
  // Availability
  hours: '09:00–18:00 America/Bogota',
  offHours: 'self_service_only', // self_service_only | hide_widget | show_message
  // Governance & compliance
  knowledge: { TR: true, CR: true, SRAG: false }, // Truth / Curated / Sandbox-RAG planes
  consent: true,
  recording: 'with_consent', // none | with_consent | always
  jurisdiction: 'CO',
  languages: ['es', 'en'],
}

// The 7 visual states the widget must render (the core design work).
export const HTL_STATES = [
  { id: 'launcher', label: 'Launcher', iconName: 'Minimize2', note: 'Closed — floating button + unread badge.' },
  { id: 'idle', label: 'Idle', iconName: 'MessageSquare', note: 'Open, awaiting input — header, greeting, channel strip.' },
  { id: 'ai', label: 'AI chat', iconName: 'Sparkles', note: 'Active AI conversation with source citations.' },
  { id: 'handoff', label: 'Handoff', iconName: 'ArrowRightLeft', note: 'AI → human transition. The most critical state.' },
  { id: 'human', label: 'Human', iconName: 'User', note: 'Live human agent — visually distinct from AI.' },
  { id: 'offhours', label: 'Off-hours', iconName: 'Clock', note: 'Outside active hours — self-service or capture email.' },
  { id: 'survey', label: 'Survey', iconName: 'Star', note: 'Post-chat CSAT / NPS before close.' },
]

// Channels in display order, with their lucide icon + label.
export const HTL_CHANNELS = [
  { id: 'text', label: 'Text', iconName: 'MessageSquare', note: 'Always on in v1' },
  { id: 'voice', label: 'Voice', iconName: 'Mic', note: 'Needs mic permission' },
  { id: 'video', label: 'Video', iconName: 'Video', note: 'Needs camera permission' },
  { id: 'screen', label: 'Screen share', iconName: 'MonitorUp', note: 'Desktop only' },
  { id: 'payment', label: 'Payment', iconName: 'CreditCard', note: 'Needs payments integration' },
  { id: 'sign', label: 'Doc signing', iconName: 'FileSignature', note: 'In-widget signing' },
  { id: 'cobrowse', label: 'Co-browsing', iconName: 'Users', note: 'Agent sees the session' },
]

// Knowledge planes the AI can consult (governance). Maps to Truth/Sandbox lineage.
export const HTL_PLANES = [
  { id: 'TR', label: 'Truth (TR)', tone: 'truth' },
  { id: 'CR', label: 'Curated (CR)', tone: 'truth' },
  { id: 'SRAG', label: 'Sandbox RAG (SRAG)', tone: 'sandbox' },
]

export const HTL_LANGS = ['es', 'en', 'pt', 'fr', 'de']

// A canned transcript so the AI / human states feel real in the preview.
export const HTL_TRANSCRIPT = [
  { who: 'agent', text: 'Hi! I can help with billing, orders, or account questions. What do you need?' },
  { who: 'client', text: 'I was charged twice on my last order #44192.' },
  { who: 'agent', text: 'I see the duplicate charge on order #44192 — $1,200. I can request a refund or connect you with a specialist.', cite: 'TR' },
  { who: 'client', text: "I'd like to talk to a person, please." },
]

// Resolve whether the WIDGET renders dark, independent of the app theme.
export function widgetIsDark(theme, appDark) {
  if (theme === 'dark') return true
  if (theme === 'light') return false
  return appDark
}
