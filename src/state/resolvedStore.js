// Shared localStorage store for wq items resolved from Today's Focus.
// Attention Room initializes its `done` set from here so items don't reappear.

const KEY = 'aims-wq-done'

export function getResolved() {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')) }
  catch { return new Set() }
}

export function markResolved(id) {
  const s = getResolved()
  s.add(id)
  localStorage.setItem(KEY, JSON.stringify([...s]))
}

export function unmarkResolved(id) {
  const s = getResolved()
  s.delete(id)
  localStorage.setItem(KEY, JSON.stringify([...s]))
}
