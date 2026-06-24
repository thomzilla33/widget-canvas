import { useState, useEffect, useMemo } from 'react'

// Slice a list to a growing window with a "Load more" button pattern.
// Resets the window when items.length changes (filter/search applied).
export function useLoadMore(items, { initial = 12, increment } = {}) {
  const inc = increment ?? initial
  const [count, setCount] = useState(initial)

  useEffect(() => {
    setCount(initial)
  }, [items.length, initial]) // eslint-disable-line react-hooks/exhaustive-deps

  const visible = useMemo(() => items.slice(0, count), [items, count])
  const hasMore = count < items.length
  const remaining = Math.min(inc, items.length - count)

  function loadMore() {
    setCount((c) => c + inc)
  }

  return { visible, hasMore, remaining, loadMore }
}
