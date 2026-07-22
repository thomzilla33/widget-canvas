import { HOME_TASKS, HTL_ITEMS, HOME_INBOX, HOME_WORKFLOWS, GOV_EVENTS } from '../../../data/home.js'

export const URGENCY_CLASS = {
  overdue:  'text-red-500 dark:text-red-400',
  today:    'text-amber-500 dark:text-amber-400',
  upcoming: 'text-gray-400 dark:text-slate-500',
}

export function urgencyOf(t) {
  if (t.due === 'Overdue') return 'overdue'
  if (t.due === 'Today')   return 'today'
  return 'upcoming'
}

// Merge all sources into one flat array with _kind and _cat discriminators.
export function buildItems({ done, declined, archived }) {
  const gov = GOV_EVENTS
    .filter(g => !done.has(g.id) && !declined.has(g.id))
    .map(g => ({ ...g, _kind: 'gov', _cat: 'approvals' }))

  const tasks = HOME_TASKS
    .filter(t => !done.has(t.id) && !declined.has(t.id))
    .map(t => ({ ...t, _kind: 'task', _cat: 'tasks' }))

  const htl = HTL_ITEMS
    .filter(h => !done.has(h.id) && !declined.has(h.id))
    .map(h => ({ ...h, _kind: 'htl', _cat: 'approvals' }))

  const inbox = HOME_INBOX
    .filter(m => !archived.has(m.id) && !declined.has(m.id))
    .map(m => ({ ...m, _kind: 'inbox', _cat: 'messages' }))

  return [...gov, ...tasks, ...htl, ...inbox]
}

// Sort priority for the "All" tab (lower = shown first).
// Blocking gov events (workflows halted) surface above errors — they affect more than one person.
export function rank(item) {
  if (item._kind === 'gov'   && item.blocking)               return -1
  if (item.status === 'error')                               return 0
  if (item._kind === 'gov')                                  return 0.5
  if (item._kind === 'task'  && item.due === 'Overdue')      return 1
  if (item._kind === 'htl')                                  return 2
  if (item._kind === 'inbox' && item.unread && item.action)  return 3
  if (item._kind === 'task'  && item.due === 'Today')        return 4
  if (item._kind === 'inbox' && item.unread)                 return 4.5
  return 5
}

// Tab badge counts. Messages = unread only (matches email-client convention).
export function counts(allItems, read) {
  return {
    tasks:     allItems.filter(i => i._cat === 'tasks').length,
    approvals: allItems.filter(i => i._cat === 'approvals').length,
    messages:  allItems.filter(i => i._cat === 'messages' && i.unread && !read.has(i.id)).length,
  }
}

// Header badge: gov events + errors + non-error overdue + HTL + unread actionable inbox.
// t-err has both status='error' AND due='Overdue' — counted once under errors only.
export function totalUrgent(allItems, read) {
  return allItems.filter(i =>
    i._kind === 'gov' ||
    i.status === 'error' ||
    (i._kind === 'task' && i.due === 'Overdue' && i.status !== 'error') ||
    i._kind === 'htl' ||
    (i._kind === 'inbox' && i.unread && !read.has(i.id) && i.action)
  ).length
}

// Source strings from active workflows — used to show "Also in Workflows" cross-link.
export function workflowSources() {
  return new Set(HOME_WORKFLOWS.map(w => w.source))
}

// Bucket items into Overdue / Today / Next groups (shared by MyAttentionCard and AttentionRoom).
export function groupItems(allItems) {
  const overdue = []
  const today   = []
  const next    = []
  for (const item of allItems) {
    if (
      (item._kind === 'task' && item.due === 'Overdue') ||
      item.status === 'error' ||
      (item._kind === 'gov' && item.blocking)
    ) {
      overdue.push(item)
    } else if (
      (item._kind === 'task' && item.due === 'Today') ||
      item._kind === 'htl' ||
      (item._kind === 'gov' && !item.blocking) ||
      (item._kind === 'inbox' && item.unread && item.action)
    ) {
      today.push(item)
    } else {
      next.push(item)
    }
  }
  return [
    { id: 'overdue', label: 'Overdue', color: 'text-red-500 dark:text-red-400',     borderColor: 'border-l-red-400/60',                         badgeColor: 'bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400',       items: overdue },
    { id: 'today',   label: 'Today',   color: 'text-amber-500 dark:text-amber-400', borderColor: 'border-l-amber-400/60',                       badgeColor: 'bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400', items: today  },
    { id: 'next',    label: 'Next',    color: 'text-slate-400 dark:text-slate-500', borderColor: 'border-l-gray-200 dark:border-l-white/[0.08]', badgeColor: 'bg-gray-100 text-gray-500 dark:bg-white/[0.07] dark:text-slate-500',      items: next   },
  ].filter(g => g.items.length > 0)
}
