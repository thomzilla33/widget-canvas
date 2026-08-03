import { MY_WORK_EVENTS, WQ_ACTIONABLE_STATES } from '../data/workqueue.js'

export function matchWQIntent(q) {
  const ql = q.toLowerCase()
  if (/critical|blocking|urgent/.test(ql))                                   return 'critical'
  if (/approv/.test(ql))                                                      return 'approvals'
  if (/htl|human.*(loop|handoff)|handoff/.test(ql))                          return 'htl'
  if (/ask|question/.test(ql))                                               return 'asks'
  if (/open|pending|waiting|attention|task|work.?queue|wq|my work/.test(ql)) return 'all-open'
  return null
}

export function getWQItems(intent) {
  const actionable = MY_WORK_EVENTS.filter(e => WQ_ACTIONABLE_STATES.has(e.status ?? 'Open'))
  switch (intent) {
    case 'critical':   return actionable.filter(e => e.severity === 'Blocking')
    case 'approvals':  return actionable.filter(e => ['Promotion', 'Review', 'Break Glass'].includes(e.wqType))
    case 'htl':        return actionable.filter(e => e.wqType === 'HTL Continuation' || e.wqType === 'Handoff')
    case 'asks':       return actionable.filter(e => e.wqType === 'Ask')
    case 'all-open':
    default:           return actionable
  }
}

export function summarizeIntent(intent, items) {
  const n = items.length
  if (n === 0) {
    const label = intent === 'critical' ? 'critical tasks' : 'open tasks'
    return `Good news — no ${label} right now.`
  }
  switch (intent) {
    case 'critical':  return `You have ${n} blocking task${n !== 1 ? 's' : ''} that need immediate attention.`
    case 'approvals': return `${n} approval${n !== 1 ? 's' : ''} waiting for your decision.`
    case 'htl':       return `${n} Human-in-the-Loop pause${n !== 1 ? 's' : ''} waiting for your input.`
    case 'asks':      return `${n} open question${n !== 1 ? 's' : ''} from teammates.`
    default:          return `You have ${n} actionable item${n !== 1 ? 's' : ''} in your Work Queue right now.`
  }
}
